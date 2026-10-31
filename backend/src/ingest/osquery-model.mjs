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
  keys(batch, ['batch_id', 'collected_at', 'host', 'packages', 'listening_ports', 'process_evidence', 'network_interfaces']);
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
  if (Object.hasOwn(batch, 'network_interfaces')) {
    if (!Array.isArray(batch.network_interfaces) || batch.network_interfaces.length > 256) reject();
    for (const row of batch.network_interfaces) {
      keys(row, ['interface', 'address', 'mask']);
      if (!text(row.interface, 128)) reject();
      normalizeInterface(row);
    }
  }
  return batch;
}

// Convert only validated literal addresses; no DNS, zone identifiers or active probes.
function addressBits(value, family) {
  if (family === 4) return value.split('.').map(Number).reduce((n, octet) => (n << 8n) | BigInt(octet), 0n);
  let input = value.toLowerCase();
  if (input.includes('.')) {
    const split = input.lastIndexOf(':'), v4 = addressBits(input.slice(split + 1), 4);
    input = input.slice(0, split + 1) + (v4 >> 16n).toString(16) + ':' + (v4 & 65535n).toString(16);
  }
  const halves = input.split('::'), left = halves[0] ? halves[0].split(':') : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const parts = halves.length === 2 ? [...left, ...Array(8-left.length-right.length).fill('0'), ...right] : left;
  return parts.reduce((n, part) => (n << 16n) | BigInt('0x' + part), 0n);
}
function literal(bits, family) {
  if (family === 4) return [24n,16n,8n,0n].map(shift => Number((bits >> shift) & 255n)).join('.');
  const expanded = Array.from({length:8}, (_, i) => ((bits >> BigInt(112-i*16)) & 65535n).toString(16)).join(':');
  return new URL('http://[' + expanded + ']/').hostname.slice(1,-1);
}
export function normalizeInterface(row) {
  const family = typeof row.address === 'string' && !row.address.includes('%') ? isIP(row.address) : 0;
  if (!family || typeof row.mask !== 'string' || row.mask.includes('%') || isIP(row.mask) !== family) reject();
  const width = family === 4 ? 32 : 128, mask = addressBits(row.mask, family);
  const binary = mask.toString(2).padStart(width,'0');
  if (!/^1*0*$/.test(binary)) reject();
  const prefix = binary.indexOf('0') < 0 ? width : binary.indexOf('0');
  const bits = addressBits(row.address, family);
  return { interface: row.interface, address: literal(bits, family), cidr: literal(bits & mask, family) + '/' + prefix };
}
