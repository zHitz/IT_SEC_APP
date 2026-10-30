import { createSso } from './auth/sso.mjs';
import { createInventoryAuthorizer } from './auth/oidc.mjs';
import { createApp } from './app.mjs';
import { backendConfig } from './config.mjs';
import { createOsqueryStore } from './ingest/osquery-store.mjs';
import { createOsqueryRoute } from './ingest/osquery-route.mjs';
import {createExactInventoryReader} from './inventory/exact-reader.mjs';
import { createInventoryReader } from './inventory/reader.mjs';

const config = backendConfig(process.env);
let db, inventoryDb, ingestOsquery, readInventory, readExactInventory, authorizeInventory, sso;
try {
  if (process.env.OSQUERY_AGENT_TOKENS) {
    if (!process.env.DATABASE_URL || !process.env.OSQUERY_RAW_DIRECTORY) throw Error('INGEST_CONFIG');
    const { default: pg } = await import('pg');
    db = new pg.Client({ connectionString: process.env.DATABASE_URL }); await db.connect();
    ingestOsquery = createOsqueryRoute({ store: createOsqueryStore({ db, rawDirectory: process.env.OSQUERY_RAW_DIRECTORY,
      environment: process.env.OSQUERY_ENVIRONMENT || 'lab' }), tokens: JSON.parse(process.env.OSQUERY_AGENT_TOKENS) });
  }
  if(process.env.SSO_ENABLED && process.env.SSO_ENABLED!=='true')throw Error('SSO_CONFIG');
  if(process.env.SSO_ENABLED==='true' && process.env.INVENTORY_READ_ENABLED!=='true')throw Error('SSO_CONFIG');
  if (process.env.INVENTORY_READ_ENABLED && process.env.INVENTORY_READ_ENABLED !== 'true') throw Error('INVENTORY_CONFIG');
  if (process.env.INVENTORY_READ_ENABLED === 'true') {
    // Authentication supplements the existing loopback deployment restriction.
    if (!['127.0.0.1', '::1'].includes(config.host) || !process.env.DATABASE_URL) throw Error('INVENTORY_CONFIG');
    authorizeInventory=createInventoryAuthorizer({issuer:process.env.OIDC_ISSUER,audience:process.env.OIDC_AUDIENCE,jwksUri:process.env.OIDC_JWKS_URI,algorithm:process.env.OIDC_ALGORITHM});
    if(process.env.SSO_ENABLED==='true'){
      sso=createSso({origin:process.env.SSO_ORIGIN,issuer:process.env.OIDC_ISSUER,authorizationEndpoint:process.env.OIDC_AUTHORIZATION_ENDPOINT,tokenEndpoint:process.env.OIDC_TOKEN_ENDPOINT,jwksUri:process.env.OIDC_JWKS_URI,clientId:process.env.OIDC_CLIENT_ID,authorizeToken:authorizeInventory});
      authorizeInventory=sso.authorize;
    }
    const { default: pg } = await import('pg');
    // Separate pool avoids interleaving reads with ingest's client transaction.
    inventoryDb = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2,
      options: '-c default_transaction_read_only=on -c statement_timeout=5000' });
    await inventoryDb.query('SELECT 1');
    readInventory = createInventoryReader({ db: inventoryDb });
    readExactInventory = createExactInventoryReader({db:inventoryDb});
  }
} catch {
  console.error('Backend database/configuration failed; no credentials logged.');
  if (db) await db.end(); if (inventoryDb) await inventoryDb.end(); process.exit(1);
}
const app = createApp({ ingestOsquery, readInventory, readExactInventory, authorizeInventory, sso });
app.listen(config.port, config.host, () => console.log(`Backend listening on configured port ${config.port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => app.close(async () => { if (db) await db.end(); if (inventoryDb) await inventoryDb.end(); }));
