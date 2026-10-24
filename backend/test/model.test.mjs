import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { migrate, seed } from '../db/migrate.mjs';

const uid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
test('migration, seed, FK contracts and down on fresh embedded PostgreSQL', async () => {
  const db = new PGlite();
  try {
    console.log('POSTGRES', (await db.query('SELECT version() AS version')).rows[0].version);
    const before = await db.query("SELECT count(*)::int AS n FROM pg_tables WHERE schemaname='asset_inventory'");
    assert.equal(before.rows[0].n, 0);
    await migrate(db, 'up');
    const model = JSON.parse(await readFile(new URL('../db/schema.json', import.meta.url), 'utf8'));
    const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname='asset_inventory' ORDER BY tablename");
    assert.equal(tables.rows.length, 24);
    for (const table of Object.keys(model.entities)) {
      const fields = (await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='asset_inventory' AND table_name=$1", [table])).rows.map(row => row.column_name);
      for (const field of Object.keys(model.common)) assert.ok(fields.includes(field), `${table}.${field}`);
      for (const field of Object.keys(model.entities[table].columns)) assert.ok(fields.includes(field), `${table}.${field}`);
    }
    console.log('UP: 0 -> 24 tables (22 entities + 2 technical junctions), common and entity columns verified');
    const foreignKeys = await db.query("SELECT conname FROM pg_constraint WHERE connamespace='asset_inventory'::regnamespace AND contype='f'");
    assert.equal(foreignKeys.rows.length, 114);
    await seed(db);
    const counts = await db.query(`SELECT (SELECT count(*)::int FROM asset_inventory.host) AS hosts, (SELECT count(*)::int FROM asset_inventory.container) AS containers, (SELECT count(*)::int FROM asset_inventory.domain) AS domains, (SELECT count(*)::int FROM asset_inventory.finding WHERE type='cve') AS cve_findings`);
    assert.deepEqual(counts.rows[0], { hosts: 2, containers: 1, domains: 1, cve_findings: 1 });
    console.log('SEED', JSON.stringify(counts.rows[0]));
    assert.equal((await db.query('SELECT server_count,workstation_count FROM asset_inventory.site')).rows[0].server_count, 2);
    assert.equal((await db.query('SELECT server_count,workstation_count FROM asset_inventory.site')).rows[0].workstation_count, 1);
    await assert.rejects(db.query('UPDATE asset_inventory.host SET owner_id=$1 WHERE id=$2', [uid(999), uid(3)]), error => error.code === '23503');
    await assert.rejects(db.query('INSERT INTO asset_inventory.access_policy_identity_group VALUES ($1,$2)', [uid(17), uid(999)]), error => error.code === '23503');
    await assert.rejects(db.query('INSERT INTO asset_inventory.package_vulnerability VALUES ($1,$2)', [uid(9), uid(999)]), error => error.code === '23503');
    await assert.rejects(db.query('UPDATE asset_inventory.finding SET entity_ref=$1 WHERE id=$2', [uid(999), uid(11)]), error => error.code === '23503');
    await assert.rejects(db.query("UPDATE asset_inventory.finding SET entity_type='anything' WHERE id=$1", [uid(11)]), error => error.code === '23514');
    await assert.rejects(db.query("UPDATE asset_inventory.host SET confidence='certain' WHERE id=$1", [uid(3)]), error => error.code === '23514');
    await assert.rejects(db.query('UPDATE asset_inventory.listening_port SET port=70000'), error => error.code === '23514');
    await assert.rejects(db.query('INSERT INTO asset_inventory.image (id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,repository,digest) SELECT $1,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,repository,digest FROM asset_inventory.image', [uid(999)]), error => error.code === '23505');
    await assert.rejects(db.query('UPDATE asset_inventory.access_policy SET allowed_groups=$1 WHERE id=$2', [[uid(999)], uid(17)]), error => error.code === '23514');
    assert.deepEqual((await db.query('SELECT allowed_groups FROM asset_inventory.access_policy WHERE id=$1', [uid(17)])).rows[0].allowed_groups, [uid(18)]);
    await assert.rejects(db.query('DELETE FROM asset_inventory.identity_group_role WHERE id=$1', [uid(18)]), error => error.code === '23503');
    await db.query('DELETE FROM asset_inventory.access_policy_identity_group');
    assert.deepEqual((await db.query('SELECT allowed_groups FROM asset_inventory.access_policy')).rows[0].allowed_groups, []);
    await db.query("UPDATE asset_inventory.host SET record_status='missing' WHERE id=$1", [uid(3)]);
    await db.query("UPDATE asset_inventory.host SET record_status='retired' WHERE id=$1", [uid(3)]);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM asset_inventory.host')).rows[0].n, 2);
    assert.equal((await db.query('SELECT server_count FROM asset_inventory.site')).rows[0].server_count, 1);
    console.log('FK/validation: orphan owner, group, CVE and polymorphic finding rejected; confidence/port/projection rejected; soft state retains rows');
    await migrate(db, 'down');
    assert.equal((await db.query("SELECT count(*)::int AS n FROM pg_tables WHERE schemaname='asset_inventory'")).rows[0].n, 0);
    console.log('DOWN: 24 -> 0 tables');
    await migrate(db, 'up');
    await migrate(db, 'down');
    console.log('REAPPLY: up -> down PASS');
  } finally { await db.close(); }
});
