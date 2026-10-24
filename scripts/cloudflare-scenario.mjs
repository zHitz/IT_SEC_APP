import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { migrate } from '../backend/db/migrate.mjs';
import { CloudflareReader } from '../collectors/cloudflare/client.mjs';
import { createSyncJob, runSchedule } from '../collectors/cloudflare/job.mjs';
import { validateConfig } from '../collectors/cloudflare/config.mjs';
import { stableId } from '../collectors/cloudflare/store.mjs';
import { startMock, syntheticConfig, id } from '../backend/test/support/cloudflare-mock.mjs';

const select = 'SELECT id,domain,type,value,source,first_seen_at,last_seen_at,confidence,raw_ref,tags FROM asset_inventory.dns_record ORDER BY domain,type';
export async function verifyCloudflare() {
  const directory = await mkdtemp(join(tmpdir(), 'atlas-cloudflare-'));
  const db = new PGlite(), mock = await startMock(), logs = [];
  try {
    await migrate(db, 'up');
    const engine = (await db.query('SELECT version() AS version')).rows[0].version;
    const config = validateConfig({ ...syntheticConfig, baseUrl: mock.baseUrl, rawDirectory: directory });
    const reader = new CloudflareReader({ token: 'synthetic-test-marker', baseUrl: mock.baseUrl, synthetic: true, retries: 0 });
    const job = createSyncJob({ reader, db, config, log: value => logs.push(value) });
    const rounds = [], reports = [];
    await runSchedule({ intervalMs: config.intervalMs, maxRuns: 2, job: async () => {
      reports.push(await job()); rounds.push((await db.query(select)).rows);
    } });
    assert.equal(reports[0].status, 'success'); assert.equal(reports[1].status, 'success');
    assert.equal(rounds[0].length, 7); assert.equal(rounds[1].length, 7);
    assert.equal(reports[0].zones.reduce((n, z) => n + z.created, 0), 7);
    assert.equal(reports[1].zones.reduce((n, z) => n + z.created, 0), 0);
    assert.equal(reports[1].zones.reduce((n, z) => n + z.updated, 0), 7);
    assert.equal(reports[1].zones.reduce((n, z) => n + z.flagged, 0), 2);
    for (const row of rounds[1]) {
      const first = rounds[0].find(old => old.id === row.id);
      assert.equal(+first.first_seen_at, +row.first_seen_at);
      assert.ok(+row.last_seen_at > +first.last_seen_at);
      assert.equal(row.source, 'cloudflare'); assert.equal(row.confidence, 'confirmed');
      assert.equal(row.tags.includes('cloudflare:outside-known-range'), ['198.51.100.20', '2001:db8:2::10'].includes(row.value));
    }
    const changedId = stableId(`cloudflare:record:${id(1)}:${id(102)}`);
    await db.query('UPDATE asset_inventory.dns_record SET tags=tags || ARRAY[\'user:review\'] WHERE id=$1', [changedId]);
    mock.records[id(1)][1].content = '192.0.2.200';
    const changedReport = await job();
    const changed = (await db.query(select)).rows.find(row => row.id === changedId);
    assert.equal(changed.value, '192.0.2.200'); assert.deepEqual(changed.tags, ['user:review']);
    assert.equal(+changed.first_seen_at, +rounds[0].find(row => row.id === changedId).first_seen_at);
    const ref = new URL(changed.raw_ref); ref.hash = '';
    const snapshot = JSON.parse(await readFile(ref, 'utf8'));
    assert.equal(snapshot.cidrVersion, 'synthetic-v1');
    assert.equal(snapshot.records.find(row => row.externalId === id(102)).outsideKnownRange, false);

    // A later-zone 403 must not refresh even the already-fetched first zone.
    const beforeAuthFailure = JSON.stringify((await db.query(select)).rows);
    mock.state.failZone = id(2); mock.state.failStatus = 403;
    const denied = await job();
    assert.equal(denied.status, 'failed');
    assert.equal(JSON.stringify((await db.query(select)).rows), beforeAuthFailure);
    assert.deepEqual(denied.zones.map(zone => zone.error), ['JOB_ABORTED_AUTH', 'AUTH_OR_PERMISSION']);
    // A non-auth zone failure keeps successful-zone data and both zone log entries.
    mock.state.failStatus = 503;
    const partial = await job(); assert.equal(partial.status, 'partial'); assert.equal(partial.zones.length, 2);
    mock.state.failZone = null;

    // Inject a local DB failure after domain writes. Transaction must roll back all
    // zone inventory changes; the other zone still finishes and logs successfully.
    const beforeZone = (await db.query('SELECT last_seen_at FROM asset_inventory.domain WHERE fqdn=$1', ['first.test'])).rows[0].last_seen_at;
    const faultyDb = { query: async (sql, params) => {
      if (sql.startsWith('INSERT INTO asset_inventory.dns_record') && params[1].endsWith('.first.test')) throw Error('synthetic local DB failure');
      return db.query(sql, params);
    } };
    const rollback = await createSyncJob({ reader, db: faultyDb, config, log: value => logs.push(value) })();
    assert.equal(rollback.status, 'partial');
    const afterZone = (await db.query('SELECT last_seen_at FROM asset_inventory.domain WHERE fqdn=$1', ['first.test'])).rows[0].last_seen_at;
    assert.equal(+beforeZone, +afterZone);
    assert.equal(rollback.zones[1].error, null);
    assert.ok(mock.calls.every(call => call.method === 'GET'));
    for (const report of [...reports, changedReport, denied, partial, rollback]) {
      assert.ok(report.startedAt && report.finishedAt);
      for (const zone of report.zones) for (const field of ['startedAt', 'finishedAt', 'fetched', 'created', 'updated', 'flagged', 'error']) assert.ok(field in zone);
    }
    const tables = (await db.query("SELECT count(*)::int AS n FROM pg_tables WHERE schemaname='asset_inventory'")).rows[0].n;
    assert.equal(tables, 24);
    return { synthetic: true, engine, tables, intervalMs: config.intervalMs, knownCidrs: config.knownCidrs,
      cidrVersion: config.cidrVersion, rounds, reports, changed, snapshot, denied, partial, rollback, logs,
      requests: mock.calls, assertions: ['AC1 seven records, A/AAAA/CNAME/MX/TXT and complete provenance',
        'AC2 7 -> 7, first_seen_at unchanged, last_seen_at advanced, 0 created/7 updated',
        'AC3 real loopback HTTP mock received only GET', 'AC4 known IPv4/IPv6 unflagged, outside IPv4/IPv6 flagged; flag cleared after content update, user tag retained',
        'AC5 actual interval scheduler completed two sequential runs with full logs', 'Late403 no inventory writes;503 isolates one zone;database failure rolls back zone transaction;24tables unchanged'] };
  } finally {
    await mock.close(); await db.close();
    if (dirname(resolve(directory)) !== resolve(tmpdir()) || !basename(directory).startsWith('atlas-cloudflare-')) throw Error('UNSAFE_TEMP_CLEANUP');
    await rm(directory, { recursive: true, force: true });
  }
}
