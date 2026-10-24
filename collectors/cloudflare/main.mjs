import { CloudflareReader } from './client.mjs';
import { loadConfig } from './config.mjs';
import { inspectReadiness, validateReadiness, readinessError } from './readiness.mjs';

let db;
try {
  const args=process.argv.slice(2);
  if(args.some(arg=>!['--once','--dry-run','--check'].includes(arg))||new Set(args).size!==args.length||(args.length>1))throw Object.assign(new Error(),{code:'READINESS_MODE_INVALID'});
  if (process.argv.includes('--dry-run') || process.argv.includes('--check')) {
    console.log(JSON.stringify(await inspectReadiness({configPath:process.env.CLOUDFLARE_CONFIG,token:process.env.CLOUDFLARE_API_TOKEN,mode:process.argv.includes('--dry-run')?'dry-run':'check'})));
  } else {
  if (!process.env.CLOUDFLARE_CONFIG) throw Object.assign(new Error(),{code:'CLOUDFLARE_CONFIG_REQUIRED'});
  const config = await loadConfig(process.env.CLOUDFLARE_CONFIG);
  validateReadiness(config,{token:process.env.CLOUDFLARE_API_TOKEN,mode:'check',realOnly:!config.synthetic});
  if (!process.env.DATABASE_URL) throw Object.assign(new Error(),{code:'DATABASE_URL_REQUIRED'});
  const [{default:pg},{createSyncJob,runSchedule}]=await Promise.all([import('pg'),import('./job.mjs')]);
  const reader = new CloudflareReader({ token: process.env.CLOUDFLARE_API_TOKEN, baseUrl: config.baseUrl, synthetic: config.synthetic });
  db = new pg.Client({ connectionString: process.env.DATABASE_URL }); await db.connect();
  const abort = new AbortController();
  process.once('SIGINT', () => abort.abort()); process.once('SIGTERM', () => abort.abort());
  const sync = createSyncJob({ reader, db, config });
  const job = async () => { const report = await sync(); if (process.argv.includes('--once') && report.status !== 'success') process.exitCode = 1; return report; };
  await runSchedule({ job, intervalMs: config.intervalMs, signal: abort.signal, maxRuns: process.argv.includes('--once') ? 1 : Infinity });
  }
} catch (error) {
  const code = readinessError(error);
  console.error(JSON.stringify({ event: 'worker_failed', code })); process.exitCode = 1;
} finally { if (db) await db.end(); }
