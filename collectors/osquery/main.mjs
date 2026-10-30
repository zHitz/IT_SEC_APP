import { readFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { readSource, buildBatches } from './source.mjs';
import { DurableQueue } from './queue.mjs';
import { validateCollectorConfig } from './config.mjs';

try {
  const config = validateCollectorConfig(JSON.parse(await readFile(process.env.OSQUERY_COLLECTOR_CONFIG, 'utf8')));
  const queue = new DurableQueue({ directory: config.queueDirectory, maxBytes: config.maxQueueBytes });
  const abort = new AbortController();
  process.once('SIGINT', () => abort.abort()); process.once('SIGTERM', () => abort.abort());
  const log = value => console.log(JSON.stringify({ at: new Date().toISOString(), ...value }));
  const collect = async () => {
    const data = await readSource(config);
    const batches = buildBatches(data, config);
    for (const batch of batches) await queue.enqueue(batch);
    log({ event: 'collected', batches: batches.length, queued: (await queue.files()).length,
      non_listening_evidence: batches.reduce((n, batch) => n + batch.process_evidence.non_listening_count, 0) });
  };
  const deliver = () => queue.flush({ endpoint: config.endpoint, token: process.env.OSQUERY_INGEST_TOKEN,
    attempts: config.attempts, backoffMs: config.backoffMs, timeoutMs: config.timeoutMs, log });
  // Separate collection and delivery loops keep collecting while network retry waits.
  const loop = async (action, interval) => {
    while (!abort.signal.aborted) {
      try { await action(); } catch { log({ event: 'collector_cycle_failed', code: 'COLLECTION_OR_DELIVERY_FAILED' }); }
      try { await sleep(interval, undefined, { signal: abort.signal }); } catch { break; }
    }
  };
  if (process.argv.includes('--collect-once')) await collect();
  else if (process.argv.includes('--flush-once')) await deliver();
  else if (process.argv.includes('--once')) { await collect(); await deliver(); }
  else await Promise.all([loop(collect, config.collectIntervalMs), loop(deliver, config.sendIntervalMs)]);
} catch { console.error('Collector configuration or execution failed; no source/secret details logged.'); process.exitCode = 1; }
