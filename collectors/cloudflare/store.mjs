import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isIP } from 'node:net';

const model = JSON.parse(await readFile(new URL('../../backend/db/schema.json', import.meta.url), 'utf8'));
const supported = new Set(model.entities.dns_record.columns.type.match(/'([^']+)'/g).map(s => s.slice(1, -1)));
const flag = 'cloudflare:outside-known-range';
export function stableId(key) {
  const bytes = createHash('sha256').update(key).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 128; bytes[8] = (bytes[8] & 63) | 128;
  const h = bytes.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
function name(value) {
  if (typeof value !== 'string') throw Error('RECORD_NAME');
  const result = value.toLowerCase().replace(/\.$/, '');
  if (!/^[a-z0-9_*.-]{1,253}$/.test(result) || result.split('.').some(label => !label.length || label.length > 63)) throw Error('RECORD_NAME');
  return result;
}
function normalize(record, zone) {
  if (!/^[a-f0-9]{32}$/.test(record?.id) || typeof record.type !== 'string') throw Error('RECORD_ID_TYPE');
  if (!supported.has(record.type)) return null;
  const fqdn = name(record.name), zoneName = name(zone.name);
  if (fqdn !== zoneName && !fqdn.endsWith(`.${zoneName}`)) throw Error('RECORD_OUTSIDE_ZONE');
  const value = typeof record.content === 'string' ? record.content : record.data && typeof record.data === 'object' ? JSON.stringify(record.data) : null;
  if (value === null || value.length > 65536 || !Number.isInteger(record.ttl) || record.ttl < 0
    || (record.proxied !== undefined && typeof record.proxied !== 'boolean')) throw Error('RECORD_FIELDS');
  if ((record.type === 'A' && isIP(value) !== 4) || (record.type === 'AAAA' && isIP(value) !== 6)) throw Error('RECORD_IP');
  return { id: stableId(`cloudflare:record:${zone.id}:${record.id}`), externalId: record.id, fqdn, type: record.type,
    value, ttl: record.ttl, proxied: record.proxied ?? false,
    data: record.data ?? null, priority: record.priority ?? null };
}

// Dedicated single-connection adapter. One transaction per zone; caller serializes runs.
export async function ingestZone({ db, zone, records, config, runId, observedAt }) {
  const normalized = records.map(record => normalize(record, zone));
  const mapped = normalized.filter(Boolean), skipped = records.filter((r, i) => !normalized[i]).map(r => ({ id: r.id, type: r.type }));
  if (new Set(records.map(r => r.id)).size !== records.length) throw Error('DUPLICATE_RECORD');
  const timestamp = new Date(observedAt).toISOString();
  await db.query('BEGIN');
  try {
    const evidence = [];
    for (const record of mapped) {
      let outside = false;
      if (['A', 'AAAA'].includes(record.type)) {
        const match = await db.query('SELECT EXISTS (SELECT 1 FROM unnest($2::cidr[]) AS ranges(cidr) WHERE $1::inet <<= ranges.cidr) AS known', [record.value, config.knownCidrs]);
        outside = !match.rows[0].known;
      }
      evidence.push({ ...record, outsideKnownRange: outside,
        reason: ['A', 'AAAA'].includes(record.type) ? outside ? 'IP is outside every configured known CIDR' : 'IP is inside a configured known CIDR' : 'Not an address record; CNAME resolution is outside this PoC',
        cidrVersion: config.cidrVersion });
    }
    // Unique immutable evidence file is durable before rows reference it. Rollback may
    // leave an unreferenced file, never a DB reference to a file not yet written.
    const directory = resolve(config.rawDirectory); await mkdir(directory, { recursive: true });
    const file = resolve(directory, `${runId}-${zone.id}.json`);
    await writeFile(file, JSON.stringify({ synthetic: config.synthetic, runId, zoneId: zone.id, zoneName: name(zone.name),
      observedAt: timestamp, cidrVersion: config.cidrVersion, knownCidrs: config.knownCidrs, records: evidence, skipped }, null, 2), { flag: 'wx', mode: 0o600 });
    const rawRef = pathToFileURL(file).href;
    // Zone apex plus each record owner are Domain entities; traffic/host mapping is not invented.
    for (const fqdn of new Set([name(zone.name), ...mapped.map(record => record.fqdn)])) {
      await db.query(`INSERT INTO asset_inventory.domain
        (id,fqdn,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment)
        VALUES ($1,$2,'cloudflare',$3,$3,$3,'confirmed',$4,$5)
        ON CONFLICT (fqdn) DO UPDATE SET last_seen_at=GREATEST(domain.last_seen_at,EXCLUDED.last_seen_at),
          observed_at=GREATEST(domain.observed_at,EXCLUDED.observed_at),source='cloudflare',confidence='confirmed',raw_ref=EXCLUDED.raw_ref`,
      [stableId(`domain:${fqdn}`), fqdn, timestamp, rawRef, config.environment]);
    }
    let created = 0, updated = 0;
    for (const record of evidence) {
      const old = await db.query('SELECT id,source FROM asset_inventory.dns_record WHERE id=$1', [record.id]);
      if (old.rows.length && old.rows[0].source !== 'cloudflare') throw Error('RECORD_ID_COLLISION');
      const tags = record.outsideKnownRange ? [flag] : [];
      await db.query(`INSERT INTO asset_inventory.dns_record
        (id,domain,type,value,proxied,ttl,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,tags,environment)
        VALUES ($1,$2,$3,$4,$5,$6,'cloudflare',$7,$7,$7,'confirmed',$8,$9,$10)
        ON CONFLICT (id) DO UPDATE SET domain=EXCLUDED.domain,type=EXCLUDED.type,value=EXCLUDED.value,
          proxied=EXCLUDED.proxied,ttl=EXCLUDED.ttl,last_seen_at=GREATEST(dns_record.last_seen_at,EXCLUDED.last_seen_at),
          observed_at=GREATEST(dns_record.observed_at,EXCLUDED.observed_at),confidence='confirmed',raw_ref=EXCLUDED.raw_ref,
          tags=array_remove(dns_record.tags,'cloudflare:outside-known-range') || EXCLUDED.tags`,
      [record.id, record.fqdn, record.type, record.value, record.proxied, record.ttl, timestamp, `${rawRef}#${record.externalId}`, tags, config.environment]);
      if (old.rows.length) updated++; else created++;
    }
    await db.query('COMMIT');
    return { fetched: records.length, created, updated, flagged: evidence.filter(record => record.outsideKnownRange).length, skipped: skipped.length, rawRef };
  } catch (error) { await db.query('ROLLBACK'); throw error; }
}
