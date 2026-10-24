import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createFrontend } from '../server.mjs';
import { createApp } from '../../backend/src/app.mjs';
import { checkHealth } from '../src/health.mjs';

test('frontend serves shell and proxies real backend health without exposing saved source', async () => {
  const api = createApp();
  await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
  const app = createFrontend({ root: fileURLToPath(new URL('../src/', import.meta.url)), backendOrigin: `http://127.0.0.1:${api.address().port}` });
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${app.address().port}`;
  try {
    const page = await fetch(origin);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /lang="vi"/);
    assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.match(await checkHealth((url, options) => fetch(new URL(url, origin), options)), /Backend/);
    assert.equal((await fetch(`${origin}/.env`)).status, 404);
    assert.equal((await fetch(`${origin}/Docs/TASK-S0-001.md`)).status, 404);
    assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
    await new Promise(resolve => api.close(resolve));
    assert.equal((await fetch(`${origin}/health`)).status, 502);
  } finally {
    await new Promise(resolve => app.close(resolve));
    if (api.listening) await new Promise(resolve => api.close(resolve));
  }
});

test('health UI rejects HTTP failures and malformed successful payloads', async () => {
  await assert.rejects(checkHealth(async () => ({ ok: false })));
  await assert.rejects(checkHealth(async () => ({ ok: true, json: async () => ({ status: 'ok' }) })));
  await assert.rejects(checkHealth(async () => { throw new Error('network'); }));
});
