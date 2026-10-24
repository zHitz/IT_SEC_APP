import { CloudflareReader } from './client.mjs';
import { loadConfig } from './config.mjs';
import { createSyncJob, runSchedule } from './job.mjs';
import pg from 'pg';

let db;
try {
  if (!process.env.CLOUDFLARE_CONFIG || !process.env.DATABASE_URL) throw Error('CONFIG_REQUIRED');
  const config = await loadConfig(process.env.CLOUDFLARE_CONFIG);
  const reader = new CloudflareReader({ token: process.env.CLOUDFLARE_API_TOKEN, baseUrl: config.baseUrl, synthetic: config.synthetic });
  db = new pg.Client({ connectionString: process.env.DATABASE_URL }); await db.connect();
  const abort = new AbortController();
  process.once('SIGINT', () => abort.abort()); process.once('SIGTERM', () => abort.abort());
  const sync = createSyncJob({ reader, db, config });
  const job = async () => { const report = await sync(); if (process.argv.includes('--once') && report.status !== 'success') process.exitCode = 1; return report; };
  await runSchedule({ job, intervalMs: config.intervalMs, signal: abort.signal, maxRuns: process.argv.includes('--once') ? 1 : Infinity });
} catch (error) {
  const code = /^[A-Z0-9_]{1,80}$/.test(error.code ?? '') ? error.code : 'CLOUDFLARE_WORKER_FAILED';
  console.error(JSON.stringify({ event: 'worker_failed', code })); process.exitCode = 1;
} finally { if (db) await db.end(); }
