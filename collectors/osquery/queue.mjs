import { mkdir, readdir, readFile, open, rename, stat, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { validateBatch } from '../../backend/src/ingest/osquery-model.mjs';
const pattern = /^\d{13}-[a-f0-9-]{36}\.json$/;
export class DurableQueue {
  constructor({ directory, maxBytes = 67108864 }) { this.directory = resolve(directory); this.maxBytes = maxBytes; this.busy = false; }
  async files() { await mkdir(this.directory, { recursive: true }); return (await readdir(this.directory)).filter(name => pattern.test(name)).sort(); }
  async enqueue(batch) {
    validateBatch(batch);
    const files = await this.files(), bytes = Buffer.from(JSON.stringify(batch));
    let total = 0; for (const file of files) total += (await stat(resolve(this.directory, file))).size;
    if (total + bytes.length > this.maxBytes) throw Error('QUEUE_FULL_BACKPRESSURE');
    const name = `${Date.parse(batch.collected_at)}-${batch.batch_id}.json`, path = resolve(this.directory, name);
    const handle = await open(`${path}.tmp`, 'wx', 0o600);
    try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
    await rename(`${path}.tmp`, path);
  }
  async flush({ endpoint, token, attempts = 3, backoffMs = 1000, timeoutMs = 15000, wait = sleep, log = () => {} }) {
    if (this.busy) throw Error('QUEUE_FLUSH_BUSY');
    const url = new URL(endpoint);
    if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', '[::1]'].includes(url.hostname)))
      || url.pathname !== '/api/v1/ingest/osquery' || url.username || url.password || url.search || url.hash || typeof token !== 'string' || token.length < 16
      || !Number.isInteger(attempts) || attempts < 1 || attempts > 5) throw Error('INGEST_CONFIG');
    this.busy = true;
    try {
      for (const file of await this.files()) {
        const path = resolve(this.directory, file), body = await readFile(path, 'utf8');
        const batch = validateBatch(JSON.parse(body));
        let accepted = false;
        for (let attempt = 1; attempt <= attempts; attempt++) {
          let status = 'NETWORK_ERROR';
          try {
            const response = await fetch(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(timeoutMs),
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body });
            status = `HTTP_${response.status}`;
            if (response.ok) {
              const ack = await response.json();
              if (ack.accepted === true && ack.batch_id === batch.batch_id) { await unlink(path); accepted = true; status = 'ACK'; }
              else status = 'ACK_MISMATCH';
            }
            if ([400,401,403,413,415,422].includes(response.status)) { log({ event: 'delivery_rejected', batch_id: batch.batch_id, status }); break; }
          } catch { /* Only sanitized status is logged; retain batch on every error. */ }
          log({ event: accepted ? 'batch_delivered' : 'batch_retry', batch_id: batch.batch_id, attempt, status, queued: (await this.files()).length });
          if (accepted) break;
          if (attempt < attempts) await wait(Math.min(backoffMs * 2 ** (attempt - 1), 30000));
        }
        if (!accepted) break; // Preserve FIFO and retry next delivery cycle, never discard.
      }
      return { pending: (await this.files()).length };
    } finally { this.busy = false; }
  }
}
