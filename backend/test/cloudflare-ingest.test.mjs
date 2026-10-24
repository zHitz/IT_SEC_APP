import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyCloudflare } from '../../scripts/cloudflare-scenario.mjs';
import { validateConfig } from '../../collectors/cloudflare/config.mjs';
import { CloudflareReader } from '../../collectors/cloudflare/client.mjs';
import { runSchedule, createSyncJob } from '../../collectors/cloudflare/job.mjs';
import { syntheticConfig } from './support/cloudflare-mock.mjs';

test('Cloudflare HTTP mock -> PostgreSQL: all ACs, idempotency, flag provenance, scheduling and rollback', async () => {
  const proof = await verifyCloudflare();
  console.log('CLOUDFLARE_SYNTHETIC', JSON.stringify({ tables: proof.tables, intervalMs: proof.intervalMs,
    requests: proof.requests.length, onlyGET: proof.requests.every(call => call.method === 'GET'), assertions: proof.assertions }));
});
test('worker configuration and transport fail closed; scheduler aborts without overlap', async () => {
  for (const change of [{ zoneIds: [] }, { knownCidrs: ['not-a-cidr'] }, { knownCidrs: ['192.0.2.0/33'] }, { intervalMs: 0 }]) {
    assert.throws(() => validateConfig({ ...syntheticConfig, rawDirectory: 'var/test', ...change }));
  }
  for (const baseUrl of ['http://example.test/client/v4', 'https://evil.test/client/v4', 'http://127.0.0.1:8080/redirect']) {
    assert.throws(() => new CloudflareReader({ token: 'synthetic-test-marker', synthetic: true, baseUrl }));
  }
  assert.throws(() => new CloudflareReader({ token: 'not-a-real-token', synthetic: true, baseUrl: 'http://127.0.0.1:8080/client/v4' }));
  assert.throws(() => new CloudflareReader({ token: 'synthetic-test-marker', synthetic: true }));
  const abort = new AbortController(); let count = 0;
  await runSchedule({ job: async () => { count++; abort.abort(); }, intervalMs: 25, signal: abort.signal });
  assert.equal(count, 1);
  let release;
  const waiting = new Promise(resolve => { release = resolve; });
  const job = createSyncJob({ reader: { listZones: () => waiting }, db: {}, config: { zoneIds: [] }, log: () => {} });
  const first = job(); await assert.rejects(job(), /SYNC_ALREADY_RUNNING/); release([]); await first;
});
