import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { ingestZone } from './store.mjs';

const safeCode = error => /^[A-Z0-9_]{1,80}$/.test(error?.code ?? '') ? error.code : 'ZONE_PROCESSING_FAILED';
export function createSyncJob({ reader, db, config, log = value => console.log(JSON.stringify(value)), clock = () => new Date() }) {
  let running = false;
  return async function sync() {
    if (running) throw Error('SYNC_ALREADY_RUNNING');
    running = true;
    const runId = randomUUID(), startedAt = clock().toISOString();
    const report = { runId, synthetic: config.synthetic, startedAt, finishedAt: null, zones: [], status: 'failed' };
    log({ event: 'sync_started', runId, synthetic: config.synthetic, startedAt });
    try {
      const zones = await reader.listZones();
      const selected = config.zoneIds.map(id => zones.find(zone => zone.id === id));
      if (selected.some(zone => !zone)) { const error = Error(); error.code = 'TEST_ZONE_NOT_ACCESSIBLE'; throw error; }
      let authFailed = false;
      // Fetch all zones before writing inventory: later auth failure cannot leave half an import.
      for (const zone of selected) {
        const result = { zoneId: zone.id, startedAt: clock().toISOString(), finishedAt: null, fetched: 0, created: 0, updated: 0, flagged: 0, skipped: 0, error: null };
        try { result.records = await reader.listRecords(zone.id); result.fetched = result.records.length; }
        catch (error) { result.error = safeCode(error); if (result.error === 'AUTH_OR_PERMISSION') authFailed = true; }
        report.zones.push(result);
      }
      for (const result of report.zones) {
        if (authFailed && !result.error) result.error = 'JOB_ABORTED_AUTH';
        if (!result.error) {
          try {
            const zone = selected.find(item => item.id === result.zoneId);
            Object.assign(result, await ingestZone({ db, zone, records: result.records, config, runId, observedAt: startedAt }));
          } catch (error) { result.error = safeCode(error); }
        }
        delete result.records;
        result.finishedAt = clock().toISOString();
        log({ event: 'zone_finished', runId, ...result });
      }
      report.status = report.zones.every(zone => !zone.error) ? 'success' : report.zones.some(zone => !zone.error) ? 'partial' : 'failed';
    } catch (error) { report.error = safeCode(error); }
    finally {
      report.finishedAt = clock().toISOString(); running = false;
      log({ event: 'sync_finished', ...report });
    }
    return report;
  };
}

// Fixed delay AFTER completion, not overlapping setInterval invocations.
export async function runSchedule({ job, intervalMs, signal, maxRuns = Infinity, wait = sleep }) {
  let runs = 0;
  while (!signal?.aborted && runs < maxRuns) {
    await job(); runs++;
    if (runs >= maxRuns || signal?.aborted) break;
    try { await wait(intervalMs, undefined, { signal }); }
    catch (error) { if (error.name !== 'AbortError') throw error; }
  }
  return runs;
}
