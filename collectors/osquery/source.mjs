import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { queries } from './queries.mjs';
import { validateBatch } from '../../backend/src/ingest/osquery-model.mjs';
const execute = promisify(execFile);
export async function readSource(config, onQuery = () => {}) {
  const data = {};
  if (config.sourceMode === 'sqlite-lab') {
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(config.labDatabase, { readOnly: true });
    try { for (const [table, sql] of Object.entries(queries)) { onQuery(table, sql); data[table] = db.prepare(sql).all(); } }
    finally { db.close(); }
  } else if (config.sourceMode === 'osqueryi') {
    for (const [table, sql] of Object.entries(queries)) {
      onQuery(table, sql);
      const args = ['--json', '--disable_events=true', `--config_path=${config.osqueryConfig}`, sql];
      try { const { stdout } = await execute(config.osqueryBinary, args, { timeout: config.queryTimeoutMs, maxBuffer: 16 * 1024 * 1024, windowsHide: true }); data[table] = JSON.parse(stdout); }
      catch { throw Error('OSQUERY_READ_FAILED'); }
    }
  } else throw Error('SOURCE_MODE');
  return data;
}
export function buildBatches(data, config, collectedAt = new Date().toISOString()) {
  if (data.system_info?.length !== 1 || data.os_version?.length !== 1) throw Error('HOST_IDENTITY_REQUIRED');
  const host = { hostname: data.system_info[0].hostname, host_uuid: data.system_info[0].uuid,
    os: data.os_version[0].name, os_version: data.os_version[0].version };
  const byPid = new Map(data.processes.map(p => [Number(p.pid), p.name]));
  const listeners = data.listening_ports.filter(p => Number(p.port) > 0).map(p => {
    const pid = Number(p.pid), protocol = Number(p.protocol) === 6 ? 'tcp' : Number(p.protocol) === 17 ? 'udp' : p.protocol;
    if (!byPid.has(pid)) throw Error('LISTENER_PROCESS_MISSING');
    return { port: Number(p.port), protocol, bind_address: p.address, pid, process: byPid.get(pid) };
  });
  const listeningPids = new Set(listeners.map(p => p.pid));
  const nonListening = data.processes.filter(p => !listeningPids.has(Number(p.pid))).map(p => ({ pid: Number(p.pid), name: p.name }));
  const packages = [...new Map(data.packages.map(p => [`${p.name}:${p.version}`, { name: p.name, version: p.version, ecosystem: config.ecosystem }])).values()];
  const rows = [...packages.map(value => ['packages', value]), ...listeners.map(value => ['listening_ports', value]), ...nonListening.map(value => ['records', value])];
  const batches = [];
  for (let offset = 0; offset < Math.max(rows.length, 1); offset += config.maxBatchRows) {
    const batch = { batch_id: randomUUID(), collected_at: collectedAt, host, packages: [], listening_ports: [], process_evidence: { non_listening_count: 0, records: [] } };
    for (const [kind, row] of rows.slice(offset, offset + config.maxBatchRows)) {
      if (kind === 'records') batch.process_evidence.records.push(row); else batch[kind].push(row);
    }
    batch.process_evidence.non_listening_count = batch.process_evidence.records.length;
    batches.push(validateBatch(batch));
  }
  return batches;
}
