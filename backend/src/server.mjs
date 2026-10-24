import { createApp } from './app.mjs';
import { backendConfig } from './config.mjs';
import { createOsqueryStore } from './ingest/osquery-store.mjs';
import { createOsqueryRoute } from './ingest/osquery-route.mjs';

const config = backendConfig(process.env);
let db, ingestOsquery;
if (process.env.OSQUERY_AGENT_TOKENS) {
  try {
    if (!process.env.DATABASE_URL || !process.env.OSQUERY_RAW_DIRECTORY) throw Error('INGEST_CONFIG');
    const { default: pg } = await import('pg');
    db = new pg.Client({ connectionString: process.env.DATABASE_URL }); await db.connect();
    ingestOsquery = createOsqueryRoute({ store: createOsqueryStore({ db, rawDirectory: process.env.OSQUERY_RAW_DIRECTORY,
      environment: process.env.OSQUERY_ENVIRONMENT || 'lab' }), tokens: JSON.parse(process.env.OSQUERY_AGENT_TOKENS) });
  } catch { console.error('Osquery ingest configuration/connection failed; no credentials logged.'); if (db) await db.end(); process.exit(1); }
}
const app = createApp({ ingestOsquery });
app.listen(config.port, config.host, () => console.log(`Backend listening on configured port ${config.port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => app.close(async () => { if (db) await db.end(); }));
