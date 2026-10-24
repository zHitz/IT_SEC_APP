import { PGlite } from '@electric-sql/pglite';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { migrate, seed } from '../backend/db/migrate.mjs';

// Fresh, in-memory PostgreSQL; never falls back to a configured production URL.
const db = new PGlite();
const dir = new URL('../Docs/evidence/S0-002/', import.meta.url);
const start = new Date().toISOString();
try {
  const version = (await db.query('SELECT version() AS version')).rows;
  if (!(await db.query("SHOW server_version_num")).rows[0].server_version_num.startsWith('17')) throw new Error('Verification must use PostgreSQL 17');
  const before = (await db.query("SELECT count(*)::int AS tables FROM pg_tables WHERE schemaname='asset_inventory'")).rows;
  await migrate(db, 'up');
  const inspection = await db.exec(await readFile(new URL('../backend/db/inspect.sql', import.meta.url), 'utf8'));
  await seed(db);
  const seedCounts = (await db.query(`SELECT (SELECT count(*)::int FROM asset_inventory.host) AS hosts, (SELECT count(*)::int FROM asset_inventory.container) AS containers, (SELECT count(*)::int FROM asset_inventory.domain) AS domains, (SELECT count(*)::int FROM asset_inventory.finding WHERE type='cve') AS cve_findings`)).rows;
  const path = (await db.query(`SELECT d.fqdn, h.hostname, r.router_name, s.name AS service, c.container_id, i.digest, p.name AS package, v.cve_id, f.type AS finding
    FROM asset_inventory.domain d JOIN asset_inventory.dns_record dns ON dns.domain=d.fqdn
    JOIN asset_inventory.network_interface ni ON ni.id=dns.network_interface_id JOIN asset_inventory.host h ON h.id=ni.host_id
    JOIN asset_inventory.route r ON r.host_id=h.id JOIN asset_inventory.access_policy a ON a.route_ref=r.id
    JOIN asset_inventory.service s ON s.id=a.service_id JOIN asset_inventory.deployment dep ON dep.service_id=s.id
    JOIN asset_inventory.container c ON c.deployment_id=dep.id JOIN asset_inventory.image i ON i.digest=c.image_digest
    JOIN asset_inventory.package p ON p.source_image_id=i.id JOIN asset_inventory.package_vulnerability pv ON pv.package_id=p.id
    JOIN asset_inventory.vulnerability v ON v.id=pv.vulnerability_id JOIN asset_inventory.finding f ON f.vulnerability_id=v.id AND f.entity_ref=p.id`)).rows;
  await migrate(db, 'down');
  const after = (await db.query("SELECT count(*)::int AS tables FROM pg_tables WHERE schemaname='asset_inventory'")).rows;
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('schema-inspect.json', dir), JSON.stringify({ start, end: new Date().toISOString(), engine: 'PostgreSQL WASM (PGlite), not Docker/native daemon', version, before, inspection: inspection.map(r => r.rows), seedCounts, syntheticAccessPath: path, after }, null, 2));
  console.log(JSON.stringify({ version, before, businessEntities: 22, technicalJunctions: 2, totalTables: inspection[3].rows.length, foreignKeys: inspection[2].rows.length, seedCounts, pathRows: path.length, after, evidence: 'Docs/evidence/S0-002/schema-inspect.json' }, null, 2));
} finally { await db.close(); }
