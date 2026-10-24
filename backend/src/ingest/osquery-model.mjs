import { isIP } from 'node:net';
export class IngestError extends Error {
  constructor(code, status = 422) { super(code); this.code = code; this.status = status; }
}
const reject = () => { throw new IngestError('INVALID_PAYLOAD'); };
function keys(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) reject();
}
const text = (value, max = 256) => typeof value === 'string' && value.length > 0 && value.length <= max && !/[\x00-\x1f]/.test(value);
export function validateBatch(batch) {
  keys(batch, ['batch_id', 'collected_at', 'host', 'packages', 'listening_ports', 'process_evidence']);
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(batch.batch_id ?? '') || !text(batch.collected_at)) reject();
  const observed = Date.parse(batch.collected_at);
  if (!Number.isFinite(observed) || observed > Date.now() + 300000 || observed < Date.now() - 30 * 86400000) reject();
  keys(batch.host, ['hostname', 'host_uuid', 'os', 'os_version']);
  if (!/^[a-zA-Z0-9._-]{1,253}$/.test(batch.host.hostname ?? '') || !/^[a-zA-Z0-9._-]{1,128}$/.test(batch.host.host_uuid ?? '')
    || !text(batch.host.os) || !text(batch.host.os_version)) reject();
  if (!Array.isArray(batch.packages) || !Array.isArray(batch.listening_ports) || batch.packages.length > 1000 || batch.listening_ports.length > 1000) reject();
  for (const p of batch.packages) {
    keys(p, ['name', 'version', 'ecosystem']);
    if (!text(p.name) || !text(p.version) || !['deb', 'rpm', 'other'].includes(p.ecosystem)) reject();
  }
  for (const p of batch.listening_ports) {
    keys(p, ['port', 'protocol', 'bind_address', 'pid', 'process']);
    if (!Number.isInteger(p.port) || p.port < 1 || p.port > 65535 || !['tcp', 'udp'].includes(p.protocol)
      || !isIP(p.bind_address) || !Number.isSafeInteger(p.pid) || p.pid < 0 || !text(p.process)) reject();
  }
  keys(batch.process_evidence, ['non_listening_count', 'records']);
  const evidence = batch.process_evidence;
  if (!Array.isArray(evidence.records) || evidence.records.length > 1000 || evidence.non_listening_count !== evidence.records.length) reject();
  for (const p of evidence.records) {
    keys(p, ['pid', 'name']); if (!Number.isSafeInteger(p.pid) || p.pid < 0 || !text(p.name)) reject();
  }
  return batch;
}
