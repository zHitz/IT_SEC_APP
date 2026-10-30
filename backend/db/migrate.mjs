import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// One SQL migration boundary for both pg server and embedded PostgreSQL verification.
export async function migrate(db, direction) {
  if (!['up', 'down'].includes(direction)) throw new Error('Expected migration direction up or down');
  const sql = await readFile(new URL(`./migrations/001.${direction}.sql`, import.meta.url), 'utf8');
  try { await db.exec(sql); }
  catch (error) { await db.exec('ROLLBACK'); throw error; }
}

export async function seed(db) {
  const sql = await readFile(new URL('./seed.sql', import.meta.url), 'utf8');
  try { await db.exec(sql); }
  catch (error) { await db.exec('ROLLBACK'); throw error; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const action = process.argv[2];
  if (!['up', 'down', 'seed', 'inspect'].includes(action)) throw new Error('Expected up/down/seed/inspect');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  // Never print connection strings or raw server errors, which may include credentials.
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const db = { exec: sql => client.query(sql), query: (sql, params) => client.query(sql, params) };
    if (action === 'inspect') {
      const sql = await readFile(new URL('./inspect.sql', import.meta.url), 'utf8');
      const results = await client.query(sql);
      for (const result of results) console.log(JSON.stringify(result.rows));
    } else {
      if (action === 'seed') await seed(db); else await migrate(db, action);
      console.log(`${action} PASS`);
    }
  } catch (error) {
    console.error(`Database operation failed; code=${error.code ?? 'UNKNOWN'}. No connection details logged.`);
    process.exitCode = 1;
  } finally { await client.end(); }
}
