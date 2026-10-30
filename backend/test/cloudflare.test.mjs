import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { CloudflareReader } from '../../collectors/cloudflare/client.mjs';

const id = n => n.toString(16).padStart(32, '0');
// Deliberately synthetic marker, never a real token. Never logged by the client.
const token = 'synthetic-test-marker';
const json = (rows, page = 1, totalPages = 1) => new Response(JSON.stringify({
  success: true, result: rows, result_info: { page, total_pages: totalPages },
}));
function mock(handler) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    assert.equal(options.method, 'GET', 'C-01: every outgoing request must be GET');
    assert.equal(url.origin, 'https://api.cloudflare.com');
    assert.match(url.pathname, /^\/client\/v4\/zones(?:\/[a-f0-9]{32}\/dns_records)?$/);
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    calls.push(`${url.pathname}?${url.searchParams}`);
    return handler(url, calls.length);
  };
  return { calls, fetchImpl };
}

test('Cloudflare GET-only client reads paginated zones and A/AAAA/CNAME without mutations', async () => {
  const m = mock(url => {
    const page = Number(url.searchParams.get('page'));
    if (url.pathname.endsWith('/zones')) return json([{ id: id(page), name: `zone${page}.test` }], page, 2);
    const records = [
      { id: id(10), name: 'a.zone1.test', type: 'A', content: '192.0.2.1' },
      { id: id(11), name: 'v6.zone1.test', type: 'AAAA', content: '2001:db8::1' },
      { id: id(12), name: 'alias.zone1.test', type: 'CNAME', content: 'a.zone1.test' },
    ];
    return json([records[page - 1]], page, 3);
  });
  const data = await new CloudflareReader({ token, fetchImpl: m.fetchImpl }).readTestScope([id(1)]);
  assert.deepEqual(data[0].records.map(record => record.type), ['A', 'AAAA', 'CNAME']);
  assert.equal(m.calls.length, 5);
  console.log('C-01: 5 mocked calls, all GET; 2 zone pages + 3 record pages; no live credentials/network');
});

test('late permission failure exposes no partial scope or token/error body', async () => {
  const m = mock(url => url.pathname.endsWith('/zones') ? json([{ id: id(1) }, { id: id(2) }])
    : url.pathname.includes(id(1)) ? json([{ id: id(10) }])
      : new Response(`private server body ${token}`, { status: 403 }));
  let result;
  await assert.rejects(async () => { result = await new CloudflareReader({ token, fetchImpl: m.fetchImpl }).readTestScope([id(1), id(2)]); },
    error => error.code === 'AUTH_OR_PERMISSION' && !error.stack.includes(token) && !error.message.includes('private'));
  assert.equal(result, undefined);
});

test('rate limit/network retry is bounded and honors capped delay', async () => {
  const delays = [];
  const m = mock((url, n) => n < 3 ? new Response('', { status: 429, headers: { 'retry-after': '999999' } }) : json([]));
  assert.deepEqual(await new CloudflareReader({ token, fetchImpl: m.fetchImpl, wait: async ms => delays.push(ms) }).listZones(), []);
  assert.deepEqual(delays, [30000, 30000]);
  let calls = 0;
  await assert.rejects(new CloudflareReader({ token, fetchImpl: async () => { calls++; throw Error(token); }, wait: async () => {} }).listZones(),
    error => error.code === 'NETWORK_OR_TIMEOUT' && !error.message.includes(token));
  assert.equal(calls, 3);
});

test('pagination drift, duplicate IDs and malformed envelopes fail closed', async () => {
  for (const handler of [
    url => { const page = Number(url.searchParams.get('page')); return json([{ id: id(page) }], page, page === 1 ? 2 : 3); },
    url => json([{ id: id(1) }], Number(url.searchParams.get('page')), 2),
    () => new Response('{broken'),
    () => new Response(JSON.stringify({ success: false, result: [] })),
  ]) await assert.rejects(new CloudflareReader({ token, fetchImpl: mock(handler).fetchImpl }).listZones());
});

test('explicit test scope and zone path validation prevent accidental broad collection', async () => {
  let calls = 0;
  const reader = new CloudflareReader({ token, fetchImpl: async () => { calls++; return json([]); } });
  for (const scope of [[], [id(1), id(1)], ['../../other']]) await assert.rejects(reader.readTestScope(scope));
  await assert.rejects(reader.listRecords('../tokens'));
  assert.equal(calls, 0);
  assert.throws(() => new CloudflareReader({ token: '' }));
});

test('C-01 source audit: all collector transport sites hardcode GET; no write client exists', async () => {
  const root = new URL('../../collectors/cloudflare/', import.meta.url);
  const files = (await readdir(root)).filter(name => name.endsWith('.mjs'));
  assert.ok(files.includes('client.mjs') && files.includes('job.mjs') && files.includes('main.mjs'));
  const source = (await Promise.all(files.map(file => readFile(new URL(file, root), 'utf8')))).join('\n');
  assert.equal((source.match(/this\.#fetch\(/g) ?? []).length, 1);
  assert.equal((source.match(/method:\s*'GET'/g) ?? []).length, 1);
  assert.doesNotMatch(source, /method:\s*['"](?:PUT|POST|PATCH|DELETE)['"]/i);
  assert.doesNotMatch(source, /\b(?:createRecord|updateRecord|deleteRecord|patchRecord)\s*\(/);
  console.log('C-01 source audit PASS: one transport, fixed origin, GET only; no DNS mutation interface');
});
