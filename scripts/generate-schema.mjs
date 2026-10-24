import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const model = JSON.parse(await readFile(`${root}backend/db/schema.json`, 'utf8'));
const quote = name => `"${name}"`;
const tables = Object.keys(model.entities);
const fks = [...model.foreignKeys];
const columns = {};
let sql = "BEGIN;\nCREATE SCHEMA asset_inventory;\nCOMMENT ON SCHEMA asset_inventory IS 'atlas:s0-002:001';\nSET LOCAL search_path = asset_inventory, pg_catalog;\n";
for (const [table, entity] of Object.entries(model.entities)) {
  const fields = { ...model.common, ...entity.columns };
  if (table === 'site') Object.assign(fields, { workstation_count: 'bigint NOT NULL DEFAULT 0 CHECK (workstation_count >= 0)', server_count: 'bigint NOT NULL DEFAULT 0 CHECK (server_count >= 0)' });
  if (table === 'package') {
    for (const kind of ['host', 'image']) {
      fields[`source_${kind}_id`] = `uuid GENERATED ALWAYS AS (CASE WHEN source_kind = '${kind}' THEN source_host_or_image END) STORED`;
      fks.push([table, `source_${kind}_id`, kind, 'id']);
    }
  }
  if (table === 'finding') {
    for (const target of tables.filter(t => t !== 'finding')) {
      fields[`entity_${target}_id`] = `uuid GENERATED ALWAYS AS (CASE WHEN entity_type = '${target}' THEN entity_ref END) STORED`;
      fks.push([table, `entity_${target}_id`, target, 'id']);
    }
  }
  columns[table] = fields;
  const checks = ['CHECK (first_seen_at <= last_seen_at)'];
  if (['site', 'owner_team'].includes(table)) checks.push("CHECK (source = 'manual')");
  if (table === 'listening_port') checks.push('CHECK (num_nonnulls(host_id, container_id) = 1)');
  if (table === 'deployment') checks.push('CHECK (num_nonnulls(host_id, cluster_id) = 1)');
  if (table === 'certificate') checks.push('CHECK (not_after >= not_before)');
  if (table === 'finding') {
    checks.push(`CHECK (entity_type IN (${tables.filter(t => t !== 'finding').map(t => `'${t}'`).join(', ')}))`);
    checks.push("CHECK (type <> 'cve' OR vulnerability_id IS NOT NULL)");
  }
  sql += `\n-- SRS entity: ${entity.entity}\nCREATE TABLE ${quote(table)} (\n  ${[...Object.entries(fields).map(([name, type]) => `${quote(name)} ${type}`), ...checks].join(',\n  ')}\n);\nCOMMENT ON TABLE ${quote(table)} IS '${entity.entity}';\n`;
}
for (const [table, refs] of Object.entries(model.junctions)) {
  columns[table] = Object.fromEntries(refs.map(([column]) => [column, 'uuid NOT NULL']));
  sql += `\n-- Technical junction, not a business entity (TL decision A).\nCREATE TABLE ${quote(table)} (${refs.map(([c]) => `${quote(c)} uuid NOT NULL`).join(', ')}, PRIMARY KEY (${refs.map(([c]) => quote(c)).join(', ')}));\n`;
  for (const [column, target] of refs) fks.push([table, column, target, 'id']);
}
for (const [table, column, target, targetColumn] of fks) {
  sql += `ALTER TABLE ${quote(table)} ADD CONSTRAINT ${quote(`fk_${table}_${column}`)} FOREIGN KEY (${quote(column)}) REFERENCES ${quote(target)} (${quote(targetColumn)}) ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;\n`;
  sql += `CREATE INDEX ON ${quote(table)} (${quote(column)});\n`;
}
sql += `
-- Authoritative membership is the FK junction. Keep SRS array as a read projection.
CREATE FUNCTION refresh_policy_groups() RETURNS trigger LANGUAGE plpgsql SET search_path = asset_inventory, pg_catalog AS $$
DECLARE policy uuid;
BEGIN
  FOR policy IN SELECT DISTINCT unnest(CASE WHEN TG_OP = 'INSERT' THEN ARRAY[NEW.policy_id] WHEN TG_OP = 'DELETE' THEN ARRAY[OLD.policy_id] ELSE ARRAY[OLD.policy_id, NEW.policy_id] END) LOOP
    PERFORM 1 FROM access_policy WHERE id = policy FOR UPDATE;
    UPDATE access_policy SET allowed_groups = ARRAY(SELECT identity_group_id FROM access_policy_identity_group WHERE policy_id = policy ORDER BY identity_group_id) WHERE id = policy;
  END LOOP;
  RETURN NULL;
END $$;
CREATE TRIGGER refresh_policy_groups AFTER INSERT OR UPDATE OR DELETE ON access_policy_identity_group FOR EACH ROW EXECUTE FUNCTION refresh_policy_groups();
CREATE FUNCTION verify_policy_groups() RETURNS trigger LANGUAGE plpgsql SET search_path = asset_inventory, pg_catalog AS $$
BEGIN
  IF NEW.allowed_groups IS DISTINCT FROM ARRAY(SELECT identity_group_id FROM access_policy_identity_group WHERE policy_id = NEW.id ORDER BY identity_group_id) THEN
    RAISE EXCEPTION 'allowed_groups is a read projection; write membership through the junction' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER verify_policy_groups AFTER INSERT OR UPDATE ON access_policy DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION verify_policy_groups();

CREATE FUNCTION maintain_site_counts() RETURNS trigger LANGUAGE plpgsql SET search_path = asset_inventory, pg_catalog AS $$
DECLARE count_field text;
BEGIN
  count_field := CASE WHEN TG_TABLE_NAME = 'host' THEN 'server_count' ELSE 'workstation_count' END;
  IF TG_OP <> 'INSERT' AND OLD.site_id IS NOT NULL AND OLD.record_status = 'active' THEN
    EXECUTE format('UPDATE asset_inventory.site SET %I = %I - 1 WHERE id = $1', count_field, count_field) USING OLD.site_id;
  END IF;
  IF TG_OP <> 'DELETE' AND NEW.site_id IS NOT NULL AND NEW.record_status = 'active' THEN
    EXECUTE format('UPDATE asset_inventory.site SET %I = %I + 1 WHERE id = $1', count_field, count_field) USING NEW.site_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER maintain_site_counts AFTER INSERT OR UPDATE OR DELETE ON host FOR EACH ROW EXECUTE FUNCTION maintain_site_counts();
CREATE TRIGGER maintain_site_counts AFTER INSERT OR UPDATE OR DELETE ON workstation FOR EACH ROW EXECUTE FUNCTION maintain_site_counts();
COMMIT;
`;
const down = `BEGIN;
DO $$ BEGIN
  IF obj_description(to_regnamespace('asset_inventory'), 'pg_namespace') IS DISTINCT FROM 'atlas:s0-002:001' THEN
    RAISE EXCEPTION 'Refusing to remove an absent or unowned schema';
  END IF;
END $$;
DROP SCHEMA asset_inventory CASCADE;
COMMIT;
`;
let diagram = '// Generated from backend/db/schema.json; 22 business entities + 2 technical junctions.\n';
for (const [table, fields] of Object.entries(columns)) {
  diagram += `Table ${table} {\n`;
  for (const [name, type] of Object.entries(fields)) diagram += `  ${quote(name)} "${type.split(/\s+(?:NOT|PRIMARY|DEFAULT|GENERATED|CHECK|UNIQUE)/)[0]}"${name === 'id' ? ' [pk]' : ''}\n`;
  if (model.junctions[table]) diagram += `  indexes {\n    (${model.junctions[table].map(([column]) => quote(column)).join(', ')}) [pk]\n  }\n`;
  diagram += '}\n';
}
for (const [t, c, ref, rc] of fks) diagram += `Ref: ${t}.${quote(c)} > ${ref}.${quote(rc)}\n`;
const outputs = { 'backend/db/migrations/001.up.sql': sql, 'backend/db/migrations/001.down.sql': down, 'Docs/data-model.dbml': diagram };
const check = process.argv.includes('--check');
for (const [path, text] of Object.entries(outputs)) {
  if (check) {
    if (await readFile(root + path, 'utf8') !== text) throw new Error(`Generated file drift: ${path}`);
  } else {
    await mkdir(dirname(root + path), { recursive: true });
    await writeFile(root + path, text);
  }
}
console.log(`schema ${check ? 'check' : 'generate'} PASS: ${tables.length} entities, ${Object.keys(model.junctions).length} junctions, ${fks.length} native FKs`);
