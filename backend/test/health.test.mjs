import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.mjs';
import { backendConfig } from '../src/config.mjs';

test('health serves liveness; unknown routes and writes cannot expose business endpoints', async () => {
  const app = createApp();
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${app.address().port}`;
  try {
    const health = await fetch(`${origin}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok', service: 'backend', scope: 'liveness' });
    const missing = await fetch(`${origin}/api/v1/assets`);
    assert.equal(missing.status, 404);
    const body = await missing.json();
    assert.equal(body.error.request_id, missing.headers.get('x-request-id'));
    assert.equal((await fetch(`${origin}/health`, { method: 'POST' })).status, 404);
  } finally { await new Promise(resolve => app.close(resolve)); }
});

test('configuration fails closed for missing or invalid ports', () => {
  for (const value of ['', '0', '65536', '4100x', '-1']) {
    assert.throws(() => backendConfig({ BACKEND_HOST: '127.0.0.1', BACKEND_PORT: value }));
  }
  assert.throws(() => backendConfig({ BACKEND_PORT: '4100' }));
});
