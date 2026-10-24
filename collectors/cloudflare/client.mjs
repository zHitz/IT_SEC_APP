// C-01: the only outbound transport is a fixed-origin, fixed-method GET.
// No generic request/mutation interface is exposed. Token never enters errors/logs.
import { setTimeout as sleep } from 'node:timers/promises';

export class CloudflareReadError extends Error {
  constructor(code) { super(code); this.name = 'CloudflareReadError'; this.code = code; }
}
const fail = code => { throw new CloudflareReadError(code); };
const zoneId = value => typeof value === 'string' && /^[a-f0-9]{32}$/.test(value);
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

export class CloudflareReader {
  #token; #fetch; #wait; #timeout; #retries; #maxPages; #base;
  constructor({ token, fetchImpl = fetch, wait = sleep, timeoutMs = 15000, retries = 2, maxPages = 10000,
    baseUrl = 'https://api.cloudflare.com/client/v4', synthetic = false } = {}) {
    if (typeof token !== 'string' || !token.trim() || /[\r\n]/.test(token)) fail('TOKEN_REQUIRED');
    if (!integer(timeoutMs, 1, 120000) || !integer(retries, 0, 5) || !integer(maxPages, 1, 100000)) fail('INVALID_LIMITS');
    this.#token = token; this.#fetch = fetchImpl; this.#wait = wait;
    this.#timeout = timeoutMs; this.#retries = retries; this.#maxPages = maxPages;
    let base;
    try { base = new URL(baseUrl); } catch { fail('INVALID_API_BASE'); }
    const official = base.href === 'https://api.cloudflare.com/client/v4';
    const loopback = synthetic && base.protocol === 'http:' && ['127.0.0.1', '[::1]'].includes(base.hostname)
      && base.pathname === '/client/v4' && !base.search && !base.hash && !base.username && !base.password;
    if ((!official && !loopback) || (synthetic && !loopback)) fail('INVALID_API_BASE');
    if (loopback && token !== 'synthetic-test-marker') fail('MOCK_REQUIRES_SYNTHETIC_TOKEN');
    this.#base = base.href;
  }
  async #page(path, page, perPage) {
    const url = new URL(`${this.#base}${path}`);
    url.searchParams.set('page', page); url.searchParams.set('per_page', perPage);
    for (let attempt = 0; attempt <= this.#retries; attempt++) {
      let response;
      try {
        response = await this.#fetch(url, {
          method: 'GET', redirect: 'error', signal: AbortSignal.timeout(this.#timeout),
          headers: { Authorization: `Bearer ${this.#token}`, Accept: 'application/json' },
        });
      } catch {
        if (attempt === this.#retries) fail('NETWORK_OR_TIMEOUT');
        await this.#wait(Math.min(1000 * 2 ** attempt, 10000)); continue;
      }
      if ([401, 403].includes(response.status)) fail('AUTH_OR_PERMISSION');
      if (response.status === 429 || response.status >= 500) {
        if (attempt === this.#retries) fail(response.status === 429 ? 'RATE_LIMIT' : 'UPSTREAM_UNAVAILABLE');
        const retry = Number(response.headers.get('retry-after'));
        // Both retry count and delay are bounded; malformed/absent values use backoff.
        await this.#wait(retry > 0 ? Math.min(retry * 1000, 30000) : Math.min(1000 * 2 ** attempt, 10000));
        continue;
      }
      if (!response.ok) fail(`HTTP_${response.status}`);
      let body;
      try { body = await response.json(); } catch { fail('INVALID_JSON'); }
      if (body?.success !== true || !Array.isArray(body.result)) fail('API_ENVELOPE');
      const info = body.result_info;
      if (!info || info.page !== page || !integer(info.total_pages, 0, this.#maxPages)
        || (info.total_pages < page && !(page === 1 && info.total_pages === 0 && body.result.length === 0))) fail('PAGINATION_INVALID');
      return { rows: body.result, totalPages: info.total_pages };
    }
  }
  async #all(path, perPage) {
    const rows = [], ids = new Set();
    let totalPages;
    for (let page = 1; page <= this.#maxPages; page++) {
      const result = await this.#page(path, page, perPage);
      if (totalPages !== undefined && result.totalPages !== totalPages) fail('PAGINATION_CHANGED_RETRY_JOB');
      totalPages = result.totalPages;
      for (const row of result.rows) {
        if (!zoneId(row?.id) || ids.has(row.id)) fail('DUPLICATE_OR_INVALID_ID');
        ids.add(row.id); rows.push(row);
      }
      if (page >= totalPages) return rows;
    }
    fail('PAGE_LIMIT');
  }
  async listZones() { return this.#all('/zones', 50); }
  async listRecords(id) {
    if (!zoneId(id)) fail('INVALID_ZONE_ID');
    return this.#all(`/zones/${id}/dns_records`, 100);
  }
  // Stage an entire test scope before any caller can persist it. No DB write here.
  // A late authentication/page failure returns no partial dataset to the caller.
  async readTestScope(allowedZoneIds) {
    if (!Array.isArray(allowedZoneIds) || !allowedZoneIds.length || !allowedZoneIds.every(zoneId)
      || new Set(allowedZoneIds).size !== allowedZoneIds.length) fail('EXPLICIT_TEST_ZONES_REQUIRED');
    const zones = await this.listZones();
    const selected = allowedZoneIds.map(id => zones.find(zone => zone.id === id));
    if (selected.some(zone => !zone)) fail('TEST_ZONE_NOT_ACCESSIBLE');
    const result = [];
    for (const zone of selected) result.push({ zone, records: await this.listRecords(zone.id) });
    return result;
  }
}
