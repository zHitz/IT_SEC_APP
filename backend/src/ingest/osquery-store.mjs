import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateBatch } from './osquery-model.mjs';

function identity(value) {
  const b = createHash('sha256').update(value).digest().subarray(0, 16);
  b[6] = (b[6] & 15) | 128; b[8] = (b[8] & 63) | 128;
  const h = b.toString('hex'); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
export function createOsqueryStore({ db, rawDirectory, environment = 'lab' }) {
  let tail = Promise.resolve();
  // A dedicated DB connection is serialized to avoid interleaved transactions.
  return batch => {
    const operation = tail.then(async () => {
      validateBatch(batch);
      const hostId = identity(`osquery:host:${batch.host.host_uuid}`);
      const bytes = JSON.stringify(batch), digest = createHash('sha256').update(bytes).digest('hex');
      await mkdir(resolve(rawDirectory), { recursive: true });
      const file = resolve(rawDirectory, `${batch.batch_id}-${digest}.json`);
      await writeFile(file, bytes, { mode: 0o600 });
      const raw = pathToFileURL(file).href, at = new Date(batch.collected_at).toISOString();
      await db.query('BEGIN');
      try {
        await db.query(`INSERT INTO asset_inventory.host
          (id,host_uuid,hostname,os,os_version,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment)
          VALUES($1,$2,$3,$4,$5,'osquery',$6,$6,$6,'confirmed',$7,$8)
          ON CONFLICT(host_uuid) DO UPDATE SET hostname=EXCLUDED.hostname,os=EXCLUDED.os,os_version=EXCLUDED.os_version,
          last_seen_at=EXCLUDED.last_seen_at,observed_at=EXCLUDED.observed_at,raw_ref=EXCLUDED.raw_ref,confidence='confirmed',source='osquery'
          WHERE EXCLUDED.observed_at>=host.observed_at`,
        [hostId,batch.host.host_uuid,batch.host.hostname,batch.host.os,batch.host.os_version,at,raw,environment]);
        const actualId = (await db.query('SELECT id FROM asset_inventory.host WHERE host_uuid=$1', [batch.host.host_uuid])).rows[0].id;
        for (const p of batch.packages) {
          await db.query(`INSERT INTO asset_inventory.package
            (id,name,version,normalized_version,ecosystem,source_host_or_image,source_kind,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment)
            VALUES($1,$2,$3,$3,$4,$5,'host','osquery',$6,$6,$6,'confirmed',$7,$8)
            ON CONFLICT(id) DO UPDATE SET last_seen_at=GREATEST(package.last_seen_at,EXCLUDED.last_seen_at),
              observed_at=GREATEST(package.observed_at,EXCLUDED.observed_at),raw_ref=EXCLUDED.raw_ref`,
          [identity(`osquery:package:${actualId}:${p.ecosystem}:${p.name}:${p.version}`),p.name,p.version,p.ecosystem,actualId,at,raw,environment]);
        }
        for (const p of batch.listening_ports) {
          await db.query(`INSERT INTO asset_inventory.listening_port
            (id,host_id,port,protocol,bind_address,pid,process,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment)
            VALUES($1,$2,$3,$4,$5,$6,$7,'osquery',$8,$8,$8,'confirmed',$9,$10)
            ON CONFLICT(id) DO UPDATE SET pid=EXCLUDED.pid,process=EXCLUDED.process,last_seen_at=EXCLUDED.last_seen_at,
              observed_at=EXCLUDED.observed_at,raw_ref=EXCLUDED.raw_ref WHERE EXCLUDED.observed_at>=listening_port.observed_at`,
          [identity(`osquery:port:${actualId}:${p.protocol}:${p.bind_address}:${p.port}`),actualId,p.port,p.protocol,p.bind_address,p.pid,p.process,at,raw,environment]);
        }
        await db.query('COMMIT');
        return { batch_id: batch.batch_id, host_id: actualId, accepted: true, packages: batch.packages.length,
          listening_ports: batch.listening_ports.length, non_listening_evidence: batch.process_evidence.non_listening_count };
      } catch (error) { await db.query('ROLLBACK'); throw error; }
    });
    tail = operation.catch(() => {}); return operation;
  };
}
