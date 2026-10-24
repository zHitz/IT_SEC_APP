import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
export function createLabHost(file, index) {
  const db = new DatabaseSync(file);
  db.exec(`CREATE TABLE system_info(hostname TEXT,uuid TEXT);
    CREATE TABLE os_version(name TEXT,version TEXT);
    CREATE TABLE packages(name TEXT,version TEXT);
    CREATE TABLE listening_ports(port INTEGER,protocol INTEGER,address TEXT,pid INTEGER);
    CREATE TABLE processes(pid INTEGER,name TEXT,cmdline TEXT,environ TEXT);
    CREATE TABLE lab_state(kind TEXT,value TEXT);`);
  const hostname = `linux-simulator-${index}`, uuid = `synthetic-host-${index}`;
  db.prepare('INSERT INTO system_info VALUES(?,?)').run(hostname, uuid);
  db.prepare('INSERT INTO os_version VALUES(?,?)').run('Synthetic Debian Linux lab (not a Linux kernel)', `12.${index}`);
  db.prepare('INSERT INTO packages VALUES(?,?)').run(`synthetic-php-${index}`, `8.${index}.0`);
  db.prepare('INSERT INTO packages VALUES(?,?)').run(`synthetic-web-${index}`, `1.${index}.0`);
  db.prepare('INSERT INTO listening_ports VALUES(?,?,?,?)').run(8000 + index,6,`192.0.2.${index}`,100 + index);
  db.prepare('INSERT INTO processes VALUES(?,?,?,?)').run(100 + index,`synthetic-web-${index}`,'FORBIDDEN_SYNTHETIC_CANARY','FORBIDDEN_SYNTHETIC_CANARY');
  db.prepare('INSERT INTO processes VALUES(?,?,?,?)').run(200 + index,`synthetic-worker-${index}`,'FORBIDDEN_SYNTHETIC_CANARY','FORBIDDEN_SYNTHETIC_CANARY');
  for (const kind of ['services','network','firewall','system_config']) db.prepare('INSERT INTO lab_state VALUES(?,?)').run(kind,`unchanged fixture ${index}`);
  db.close(); return { hostname, uuid, type: 'SQLite Linux inventory simulator on Windows; not real Linux/osquery', os_version: `12.${index}` };
}
export async function labFingerprint(path) { return createHash('sha256').update(await readFile(path)).digest('hex'); }
