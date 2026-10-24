import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { PGlite } from '@electric-sql/pglite';
import { migrate, seed } from '../db/migrate.mjs';
import { createApp } from '../src/app.mjs';
import { createInventoryReader, inventoryQuery } from '../src/inventory/reader.mjs';

const hostId = '00000000-0000-4000-8000-000000000003';
test('inventory GET prototype: real PostgreSQL synthetic host/package/port search, pages, counts, safe errors and no writes', async () => {
  const db = new PGlite(); let app;
  try {
    await migrate(db, 'up'); await seed(db);
    // Seed Package is image-scoped; create a distinct synthetic host package through accepted ingest path.
    const { createOsqueryStore } = await import('../src/ingest/osquery-store.mjs');
    const { mkdtemp, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os'); const { join } = await import('node:path');
    const directory = await mkdtemp(join(tmpdir(), 'inventory-test-'));
    try {
      const store = createOsqueryStore({ db, rawDirectory: directory, environment: 'synthetic-test' });
      await store({ batch_id: '00000000-0000-4000-8000-000000000099', collected_at: new Date().toISOString(),
        host: { hostname: 'inventory.test', host_uuid: 'inventory-synthetic', os: 'Synthetic Linux', os_version: '12.3' },
        packages: [{ name: 'Example%_Package', version: '1.2.3', ecosystem: 'deb' }, { name: 'second-package', version: '2', ecosystem: 'deb' }],
        listening_ports: [{ port: 9000, protocol: 'tcp', bind_address: '127.0.0.1', process: 'synthetic-listener', pid: 321 }],
        process_evidence: { non_listening_count: 0, records: [] } });
    } finally { await rm(directory, { recursive: true, force: true }); }
    const before = (await db.query('SELECT count(*)::int n FROM asset_inventory.host')).rows;
    const observedSql = [];
    await db.exec('BEGIN READ ONLY');
    const reader = createInventoryReader({ db: { query: (sql, values) => { observedSql.push(sql); return db.query(sql, values); } } });
    app = createApp({ readInventory: reader }); app.listen(0, '127.0.0.1'); await once(app, 'listening');
    const origin = `http://127.0.0.1:${app.address().port}/api/v1/inventory/`;
    const get = async path => { const response = await fetch(origin + path); assert.equal(response.status, 200); return response.json(); };
    const hosts = await get('hosts?page_size=1');
    assert.equal(hosts.meta.total, 3); assert.equal(hosts.meta.total_pages, 3); assert.equal(hosts.data.length, 1);
    const next = await get('hosts?page=2&page_size=1'); assert.notEqual(hosts.data[0].id, next.data[0].id);
    const selected = await get('hosts?search=INVENTORY.TEST');
    assert.equal(selected.meta.total, 1); assert.equal(selected.data[0].os, 'Synthetic Linux'); assert.equal(selected.data[0].os_version, '12.3');
    const syntheticId = selected.data[0].id;
    const packages = await get(`packages?host_id=${syntheticId}&search=%25_`);
    assert.equal(packages.meta.total, 1); assert.equal(packages.data[0].version, '1.2.3');
    assert.equal((await get('packages')).meta.total, 2); // image package deliberately excluded from host inventory
    assert.equal((await get(`packages?host_id=${hostId}`)).meta.total, 0);
    const ports = await get(`listening-ports?host_id=${syntheticId}`);
    assert.equal(ports.meta.total, 1); assert.equal(ports.data[0].process, 'synthetic-listener'); assert.equal(ports.data[0].pid, 321);
    assert.equal((await get('listening-ports')).meta.total, 2);
    const beyond = await get('hosts?page=100'); assert.deepEqual(beyond.data, []); assert.equal(beyond.meta.total, 3);
    const absent = await get('hosts?search=missing'); assert.equal(absent.meta.total, 0); assert.equal(absent.meta.total_pages, 0);
    assert.equal((await get("hosts?search=' OR 1=1 --")).meta.total, 0);
    for (const suffix of ['hosts?page=0','hosts?page=-1','hosts?page_size=101','hosts?page=1&page=2','hosts?x=1','hosts?search=','hosts?search=%00','packages?host_id=bad','listening-ports?search=x']) {
      const response = await fetch(origin + suffix); assert.equal(response.status, 400, suffix); assert.equal((await response.json()).error.code, 'INVALID_QUERY');
    }
    for (const method of ['POST','PUT','DELETE','PATCH','HEAD']) {
      const response = await fetch(origin + 'hosts', { method }); assert.equal(response.status, 405); assert.equal(response.headers.get('allow'), 'GET');
    }
    assert.equal((await fetch(origin + 'hosts/extra')).status, 404);
    assert.equal((await fetch(origin + 'hosts')).headers.get('cache-control'), 'no-store');
    assert.ok(observedSql.every(sql => sql.startsWith('WITH filtered AS (SELECT ') && !/\b(INSERT|UPDATE|DELETE|ALTER|DROP)\b/.test(sql)));
    await db.exec('COMMIT'); assert.deepEqual((await db.query('SELECT count(*)::int n FROM asset_inventory.host')).rows, before);
    console.log('INVENTORY_V4_PROOF', JSON.stringify({ engine: 'PostgreSQL17.5 WASM', synthetic: true, readOnlyTransaction: true, hosts: 3, hostPackages: 2, hostPorts: 2, searchLiteral: true, stablePages: true, pageCountsConsistent: true, getOnly: true, sqlStatements: observedSql.length, schemaChanged: false, nativeLinux: false }));
  } finally { if (app) await new Promise(resolve => app.close(resolve)); await db.close(); }
});
test('inventory query bounds and sanitized unavailable errors', async () => {
  for (const query of ['page=100001','page_size=1.2','page=1e2',`search=${'a'.repeat(201)}`]) assert.throws(() => inventoryQuery('hosts', new URLSearchParams(query)));
  const app = createApp({ readInventory: async () => { throw Error('postgres://secret-password@example/private'); } });
  app.listen(0, '127.0.0.1'); await once(app, 'listening');
  try {
    const response = await fetch(`http://127.0.0.1:${app.address().port}/api/v1/inventory/hosts`);
    assert.equal(response.status, 503); const text = await response.text(); assert.ok(!text.includes('secret-password')); assert.equal(JSON.parse(text).error.code, 'INVENTORY_UNAVAILABLE');
  } finally { await new Promise(resolve => app.close(resolve)); }
});

 test('inventory startup refuses non-loopback binding before opening a database', async () => {
  const { spawnSync } = await import('node:child_process');
  const child = spawnSync(process.execPath, ['backend/src/server.mjs'], { encoding: 'utf8', env: {
    ...process.env, BACKEND_HOST: '0.0.0.0', BACKEND_PORT: '9199', INVENTORY_READ_ENABLED: 'true',
    OSQUERY_AGENT_TOKENS: '', DATABASE_URL: 'postgres://synthetic-not-used@127.0.0.1:1/test' } });
  assert.equal(child.status, 1); assert.match(child.stderr, /configuration failed/); assert.ok(!child.stderr.includes('synthetic-not-used'));
 });
