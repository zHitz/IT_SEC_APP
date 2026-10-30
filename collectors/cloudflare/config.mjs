import { readFile } from 'node:fs/promises';
import { isIP } from 'node:net';

export function validateConfig(input) {
  const c = structuredClone(input);
  if (!Array.isArray(c.zoneIds) || !c.zoneIds.length || c.zoneIds.some(id => !/^[a-f0-9]{32}$/.test(id))
    || new Set(c.zoneIds).size !== c.zoneIds.length) throw Error('CONFIG_TEST_SCOPE');
  if (typeof c.cidrVersion !== 'string' || !/^[a-zA-Z0-9_.-]{1,80}$/.test(c.cidrVersion)
    || !Array.isArray(c.knownCidrs) || !c.knownCidrs.length) throw Error('CONFIG_CIDRS');
  for (const cidr of c.knownCidrs) {
    if (typeof cidr !== 'string') throw Error('CONFIG_CIDRS');
    const parts = cidr.split('/'), family = isIP(parts[0]), bits = Number(parts[1]);
    if (parts.length !== 2 || !family || !/^\d+$/.test(parts[1]) || bits > (family === 4 ? 32 : 128)) throw Error('CONFIG_CIDRS');
  }
  if (!Number.isInteger(c.intervalMs) || c.intervalMs < 10 || c.intervalMs > 86400000) throw Error('CONFIG_INTERVAL');
  if (typeof c.rawDirectory !== 'string' || !c.rawDirectory.trim() || typeof c.environment !== 'string' || !c.environment) throw Error('CONFIG_STORAGE');
  if (typeof c.synthetic !== 'boolean') throw Error('CONFIG_SYNTHETIC');
  if (c.synthetic && !c.baseUrl) throw Error('CONFIG_SYNTHETIC_API_REQUIRED');
  return Object.freeze(c);
}
export async function loadConfig(path) { return validateConfig(JSON.parse(await readFile(path, 'utf8'))); }
