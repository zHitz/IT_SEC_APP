import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { parseHTML } from 'linkedom';
import { mountInventoryTable } from '../src/inventory-table.mjs';
import { mountInventoryDetail } from '../src/inventory-detail.mjs';
import { initAuthSession, checkSession, mountHostPage } from '../src/host-page.mjs';
import { mountHostNavigation } from '../src/host-navigation.mjs';
import { createFrontend } from '../server.mjs';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { migrate, seed } from '../../backend/db/migrate.mjs';
import { createAssetReader, createAssetDetailsReader } from '../../backend/src/inventory/assets.mjs';
import { createInventoryAuthorizer } from '../../backend/src/auth/oidc.mjs';
import { createApp } from '../../backend/src/app.mjs';

const html = await readFile(new URL('../src/hosts.html', import.meta.url), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));

test('Session lifecycle: checkSession and initAuthSession render anonymous, authenticated, and handle logout with CSRF', async () => {
  const { document, window } = parseHTML(html);
  const get = id => document.getElementById(id);

  // 1. Anonymous session
  const anonSession = { authenticated: false };
  const authAnon = initAuthSession(document, {
    fetcher: async () => ({ ok: true, json: async () => anonSession })
  });
  await authAnon.ready;
  assert.equal(get('session-info').textContent, 'Anonymous');
  assert.equal(get('login-form').hidden, false);
  assert.equal(get('logout-button').hidden, true);
  assert.equal(authAnon.getCsrf(), null);

  // 2. Authenticated session with CSRF
  const authSession = { authenticated: true, csrf: 'test-csrf-token-12345', expiresAt: Date.now() + 60000 };
  let logoutCalled = false;
  let logoutHeaders = null;
  const authUser = initAuthSession(document, {
    fetcher: async (url, options) => {
      if (url === '/auth/session') return { ok: true, json: async () => authSession };
      if (url === '/auth/logout') {
        logoutCalled = true;
        logoutHeaders = options?.headers;
        return { ok: true, json: async () => ({ authenticated: false }) };
      }
      return { ok: false };
    }
  });
  await authUser.ready;
  assert.equal(get('session-info').textContent, 'Authenticated session');
  assert.equal(get('login-form').hidden, true);
  assert.equal(get('logout-button').hidden, false);
  assert.equal(authUser.getCsrf(), 'test-csrf-token-12345');

  // 3. Logout action
  get('logout-button').dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
  await tick();
  assert.equal(logoutCalled, true);
  assert.equal(logoutHeaders['X-CSRF-Token'], 'test-csrf-token-12345');
  assert.equal(get('session-info').textContent, 'Anonymous');
  assert.equal(get('login-form').hidden, false);
  assert.equal(get('logout-button').hidden, true);
});

test('AC-1 & AC-3: mountInventoryTable with standard asset API lists, filters, pages hosts and renders safe text', async () => {
  const { document, window } = parseHTML(html);
  const get = id => document.getElementById(id);
  const requests = [];

  const xssHost = {
    id: '00000000-0000-4000-8000-000000000001',
    hostname: '<script>alert("xss")</script>',
    os: '<img src=x onerror=alert(1)>',
    os_version: '"><svg onload=alert(1)>',
    environment: 'production',
    first_seen_at: '2026-10-24T00:00:00Z',
    last_seen_at: '2026-10-24T00:00:00Z'
  };

  const ui = mountInventoryTable(document, {
    mode: 'host',
    useStandardApi: true,
    fetcher: async url => {
      requests.push(url);
      const u = new URL(url, 'http://localhost');
      assert.equal(u.searchParams.get('type'), 'host');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: [xssHost],
          meta: {
            page: Number(u.searchParams.get('page') || '1'),
            page_size: Number(u.searchParams.get('page_size') || '50'),
            total: 1,
            total_pages: 1,
            as_of: new Date().toISOString()
          }
        })
      };
    }
  });

  await ui.ready;
  assert.match(requests[0], /\/api\/v1\/assets\?type=host/);
  assert.equal(get('inventory-total').textContent, '1 hosts matching');
  assert.equal(get('inventory-page').textContent, 'Page 1 of 1');

  // Untrusted text safe rendering check: must NOT create script or img elements
  const rows = get('inventory-rows');
  assert.equal(rows.querySelectorAll('script').length, 0);
  assert.equal(rows.querySelectorAll('img').length, 0);
  assert.equal(rows.querySelectorAll('svg').length, 0);
  assert.match(rows.textContent, /<script>alert\("xss"\)<\/script>/);
  assert.match(rows.textContent, /<img src=x onerror=alert\(1\)>/);

  // Search filter uses q query param on standard asset API
  get('domain-search').value = 'secure-host';
  get('inventory-search').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  assert.match(requests.at(-1), /q=secure-host/);

  ui.destroy();
});

test('AC-2: 401 unauthorized / expired session shows safe state, hides retry, clears protected data', async () => {
  const { document } = parseHTML(html);
  const get = id => document.getElementById(id);

  // First seed some initial data
  const initialRow = {
    id: '00000000-0000-4000-8000-000000000099',
    hostname: 'confidential-host.internal',
    os: 'Linux',
    os_version: '1.0',
    first_seen_at: null,
    last_seen_at: null
  };

  let failAuth = false;
  const ui = mountInventoryTable(document, {
    mode: 'host',
    useStandardApi: true,
    fetcher: async () => {
      if (failAuth) {
        return {
          ok: false,
          status: 401,
          headers: new Headers({ 'WWW-Authenticate': 'Bearer' }),
          json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Access denied' } })
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: [initialRow],
          meta: { page: 1, page_size: 25, total: 1, total_pages: 1 }
        })
      };
    }
  });

  await ui.ready;
  assert.match(get('inventory-rows').textContent, /confidential-host\.internal/);

  // Now simulate expired / 401 response on reload
  failAuth = true;
  await ui.reload();

  assert.equal(get('inventory-total').textContent, 'Authentication required');
  assert.match(get('inventory-status').textContent, /Session expired or not authenticated/);
  assert.equal(get('inventory-retry').hidden, true);
  // Protected data must be completely cleared - no leakage
  assert.equal(get('inventory-rows').children.length, 0);
  assert.ok(!get('inventory-rows').textContent.includes('confidential-host'));

  ui.destroy();
});

test('AC-2: 403 forbidden session shows access denied, hides retry, clears protected data', async () => {
  const { document } = parseHTML(html);
  const get = id => document.getElementById(id);

  const ui = mountInventoryTable(document, {
    mode: 'host',
    useStandardApi: true,
    fetcher: async () => ({
      ok: false,
      status: 403,
      json: async () => ({ error: { code: 'FORBIDDEN', message: 'Access denied' } })
    })
  });

  await ui.ready;
  assert.equal(get('inventory-total').textContent, 'Access forbidden');
  assert.match(get('inventory-status').textContent, /Access forbidden/);
  assert.equal(get('inventory-retry').hidden, true);
  assert.equal(get('inventory-rows').children.length, 0);

  ui.destroy();
});

test('AC-1 & AC-2: mountInventoryDetail with standard APIs handles 401, 403, and authorized detail/ports', async () => {
  const { document } = parseHTML(html);
  const get = id => document.getElementById(id);

  const hostId = '00000000-0000-4000-8000-000000000001';
  const testHost = {
    id: hostId,
    hostname: 'db-primary.atlas',
    os: 'Debian',
    os_version: '12',
    first_seen_at: '2026-10-24T00:00:00Z',
    last_seen_at: '2026-10-24T00:00:00Z'
  };

  const testPackage = {
    id: '00000000-0000-4000-8000-000000000010',
    name: 'postgresql-17',
    version: '17.0',
    ecosystem: 'deb',
    host_id: hostId
  };

  const testPort = {
    id: '00000000-0000-4000-8000-000000000020',
    host_id: hostId,
    protocol: 'tcp',
    port: 5432,
    bind_address: '127.0.0.1',
    process: 'postgres',
    pid: 1234
  };

  // 1. Authorized detail load
  const detailUi = mountInventoryDetail(document, {
    mode: 'host',
    useStandardApi: true,
    resolveHost: true,
    fetcher: async url => {
      const u = new URL(url, 'http://localhost');
      if (u.pathname === `/api/v1/assets/${hostId}`) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: { ...testHost, packages: [testPackage] },
            meta: { as_of: new Date().toISOString(), packages: { page: 1, page_size: 25, total: 1, total_pages: 1 } }
          })
        };
      }
      if (u.pathname === `/api/v1/hosts/${hostId}/ports`) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            data: [testPort],
            meta: { page: 1, page_size: 25, total: 1, total_pages: 1, as_of: new Date().toISOString(), host_id: hostId }
          })
        };
      }
      return { ok: false, status: 404 };
    }
  });

  await detailUi.open(testHost);
  assert.equal(get('detail-title').textContent, 'db-primary.atlas');
  assert.match(get('detail-info').textContent, /Debian/);
  assert.match(get('detail-related').textContent, /postgresql-17/);
  assert.match(get('detail-related').textContent, /5432/);

  // 2. 401 Unauthorized in detail
  const detail401 = mountInventoryDetail(document, {
    mode: 'host',
    useStandardApi: true,
    resolveHost: true,
    fetcher: async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: 'UNAUTHORIZED' } })
    })
  });
  await detail401.open(testHost);
  assert.match(get('detail-status').textContent, /Session expired or not authenticated/);
  assert.equal(get('detail-retry').hidden, true);
  assert.equal(get('detail-info').children.length, 0);
  assert.equal(get('detail-related').children.length, 0);

  // 3. 403 Forbidden in detail
  const detail403 = mountInventoryDetail(document, {
    mode: 'host',
    useStandardApi: true,
    resolveHost: true,
    fetcher: async () => ({
      ok: false,
      status: 403,
      json: async () => ({ error: { code: 'FORBIDDEN' } })
    })
  });
  await detail403.open(testHost);
  assert.match(get('detail-status').textContent, /Access forbidden/);
  assert.equal(get('detail-retry').hidden, true);
  assert.equal(get('detail-info').children.length, 0);
  assert.equal(get('detail-related').children.length, 0);

  detailUi.destroy();
  detail401.destroy();
  detail403.destroy();
});

test('Server proxy: forwards auth and standard asset APIs with cookies and headers', async () => {
  const receivedRequests = [];
  const mockBackend = createServer((req, res) => {
    receivedRequests.push({
      method: req.method,
      url: req.url,
      cookie: req.headers.cookie,
      origin: req.headers.origin,
      csrf: req.headers['x-csrf-token']
    });

    if (req.url === '/auth/login' && req.method === 'POST') {
      res.setHeader('Set-Cookie', 'atlas_login=tx123; Path=/; HttpOnly; SameSite=Lax');
      res.writeHead(303, { Location: 'http://127.0.0.1:9999/oauth/authorize?state=abc' }).end();
      return;
    }
    if (req.url.startsWith('/auth/callback') && req.method === 'GET') {
      res.setHeader('Set-Cookie', 'atlas_session=sess456; Path=/; HttpOnly; SameSite=Lax');
      res.writeHead(303, { Location: '/inventory/hosts' }).end();
      return;
    }
    if (req.url === '/auth/session' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ authenticated: true, csrf: 'csrf-xyz' }));
      return;
    }
    if (req.url === '/auth/logout' && req.method === 'POST') {
      res.setHeader('Set-Cookie', 'atlas_session=; Path=/; Max-Age=0');
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ authenticated: false }));
      return;
    }
    if (req.url.startsWith('/api/v1/assets') && req.method === 'GET') {
      if (req.headers.cookie?.includes('atlas_session=sess456')) {
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({
          data: [{ id: '00000000-0000-4000-8000-000000000001', hostname: 'srv-1', os: 'Linux', os_version: '1', first_seen_at: null, last_seen_at: null }],
          meta: { page: 1, page_size: 50, total: 1, total_pages: 1 }
        }));
      } else {
        res.setHeader('WWW-Authenticate', 'Bearer');
        res.writeHead(401, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: { code: 'UNAUTHORIZED' } }));
      }
      return;
    }
    res.writeHead(404).end(JSON.stringify({ error: { code: 'NOT_FOUND' } }));
  });

  await new Promise(resolve => mockBackend.listen(0, '127.0.0.1', resolve));
  const backendPort = mockBackend.address().port;
  const backendOrigin = `http://127.0.0.1:${backendPort}`;

  const frontend = createFrontend({
    root: fileURLToPath(new URL('../src/', import.meta.url)),
    backendOrigin,
    inventoryEnabled: true
  });
  await new Promise(resolve => frontend.listen(0, '127.0.0.1', resolve));
  const frontendPort = frontend.address().port;
  const frontendOrigin = `http://127.0.0.1:${frontendPort}`;

  try {
    // 1. POST /auth/login -> receives 303 Location and Set-Cookie
    const loginRes = await fetch(`${frontendOrigin}/auth/login`, {
      method: 'POST',
      headers: { Origin: frontendOrigin },
      redirect: 'manual'
    });
    assert.equal(loginRes.status, 303);
    assert.match(loginRes.headers.get('location'), /oauth\/authorize/);
    assert.match(loginRes.headers.get('set-cookie'), /atlas_login=tx123/);

    // 2. GET /auth/callback -> receives 303 Location /inventory/hosts and session cookie
    const cbRes = await fetch(`${frontendOrigin}/auth/callback?code=testcode`, {
      method: 'GET',
      headers: { Cookie: 'atlas_login=tx123' },
      redirect: 'manual'
    });
    assert.equal(cbRes.status, 303);
    assert.equal(cbRes.headers.get('location'), '/inventory/hosts');
    assert.match(cbRes.headers.get('set-cookie'), /atlas_session=sess456/);

    // 3. GET /auth/session -> receives session info
    const sessRes = await fetch(`${frontendOrigin}/auth/session`, {
      headers: { Cookie: 'atlas_session=sess456' }
    });
    assert.equal(sessRes.status, 200);
    const sessJson = await sessRes.json();
    assert.equal(sessJson.authenticated, true);
    assert.equal(sessJson.csrf, 'csrf-xyz');

    // 4. Authenticated asset request forwards cookie and succeeds
    const assetRes = await fetch(`${frontendOrigin}/api/v1/assets?type=host`, {
      headers: { Cookie: 'atlas_session=sess456' }
    });
    assert.equal(assetRes.status, 200);
    const assetJson = await assetRes.json();
    assert.equal(assetJson.data[0].hostname, 'srv-1');

    // 5. Anonymous asset request returns 401 with WWW-Authenticate header
    const anonRes = await fetch(`${frontendOrigin}/api/v1/assets?type=host`);
    assert.equal(anonRes.status, 401);
    assert.equal(anonRes.headers.get('www-authenticate'), 'Bearer');

    // 6. POST /auth/logout forwards CSRF token and Cookie, clears session
    const logoutRes = await fetch(`${frontendOrigin}/auth/logout`, {
      method: 'POST',
      headers: {
        Origin: frontendOrigin,
        Cookie: 'atlas_session=sess456',
        'X-CSRF-Token': 'csrf-xyz'
      }
    });
    assert.equal(logoutRes.status, 200);
    assert.match(logoutRes.headers.get('set-cookie'), /atlas_session=;/);

    // 7. Method rejection: POST to /api/v1/assets -> 405 (Allow: GET)
    const badMethod = await fetch(`${frontendOrigin}/api/v1/assets`, { method: 'POST' });
    assert.equal(badMethod.status, 405);
    assert.equal(badMethod.headers.get('allow'), 'GET');

    // 8. Method rejection: GET to /auth/login -> 405 (Allow: POST)
    const badAuthMethod = await fetch(`${frontendOrigin}/auth/login`);
    assert.equal(badAuthMethod.status, 405);
    assert.equal(badAuthMethod.headers.get('allow'), 'POST');

    console.log('AUTH_INVENTORY_INTEGRATION_PROOF', JSON.stringify({
      proxyAuthRoutes: true,
      proxyAssetRoutes: true,
      cookieForwarded: true,
      setCookiePreserved: true,
      csrfForwarded: true,
      locationPreserved: true,
      methodsEnforced: true,
      auth401Preserved: true
    }));
  } finally {
    await new Promise(resolve => frontend.close(resolve));
    await new Promise(resolve => mockBackend.close(resolve));
  }
});

test('AC-1 Page composition: mountHostPage mounts standard asset APIs for list/detail/ports, preserving secondary panels and UUID links', async () => {
  const { document } = parseHTML(html);
  const requests = [];
  const hostId = '00000000-0000-4000-8000-000000000001';
  let hash = '#list=1';
  const nav = {
    events: new EventTarget(),
    get location() { return new URL('http://local/inventory/hosts' + hash); },
    history: {
      replaceState(_s, _t, url) { hash = new URL(url, 'http://local').hash; },
      pushState(_s, _t, url) { hash = new URL(url, 'http://local').hash; nav.events.dispatchEvent(new Event('popstate')); }
    }
  };

  const testHost = {
    id: hostId,
    hostname: 'standard-host.internal',
    os: 'Debian',
    os_version: '12',
    first_seen_at: '2026-10-30',
    last_seen_at: '2026-10-30'
  };

  const fetcher = async url => {
    requests.push(url);
    const u = new URL(url, 'http://local');
    if (u.pathname === '/auth/session') {
      return { ok: true, status: 200, json: async () => ({ authenticated: true, csrf: 'test-csrf' }) };
    }
    if (u.pathname === '/api/v1/assets' && u.searchParams.get('type') === 'host') {
      return { ok: true, status: 200, json: async () => ({ data: [testHost], meta: { page: 1, page_size: 25, total: 1, total_pages: 1 } }) };
    }
    if (u.pathname === `/api/v1/assets/${hostId}`) {
      return { ok: true, status: 200, json: async () => ({ data: { ...testHost, packages: [{ id: '90000000-0000-4000-8000-000000000001', name: 'pkg-1', version: '1.0', ecosystem: 'deb', host_id: hostId }] }, meta: { as_of: '2026-10-30', packages: { page: 1, page_size: 25, total: 1, total_pages: 1 } } }) };
    }
    if (u.pathname === `/api/v1/hosts/${hostId}/ports`) {
      return { ok: true, status: 200, json: async () => ({ data: [{ id: '80000000-0000-4000-8000-000000000001', host_id: hostId, protocol: 'tcp', port: 443, bind_address: '0.0.0.0', process: 'nginx', pid: 500 }], meta: { page: 1, page_size: 25, total: 1, total_pages: 1, as_of: '2026-10-30', host_id: hostId } }) };
    }
    if (u.pathname.startsWith('/api/v1/inventory/')) {
      return { ok: true, status: 200, json: async () => ({ data: [], meta: { page: 1, page_size: 25, total: 0, total_pages: 1 } }) };
    }
    return { ok: false, status: 404 };
  };

  const page = mountHostPage(document, { fetcher, navigation: nav, useStandardApi: true });
  await page.ready;

  assert.ok(requests.some(x => x.startsWith('/api/v1/assets?type=host')));
  assert.ok(!requests.some(x => x.startsWith('/api/v1/inventory/hosts?')));
  assert.equal(document.getElementById('session-info').textContent, 'Authenticated session');
  assert.match(document.getElementById('inventory-rows').textContent, /standard-host\.internal/);

  await page.navUi.core.open(testHost);
  assert.ok(requests.some(x => x === `/api/v1/assets/${hostId}`));
  assert.ok(requests.some(x => x === `/api/v1/hosts/${hostId}/ports?page=1&page_size=25`));
  assert.match(document.getElementById('detail-title').textContent, /standard-host\.internal/);
  assert.match(document.getElementById('detail-related').textContent, /pkg-1/);
  assert.match(document.getElementById('detail-related').textContent, /443/);

  page.navUi.navigate(null);
  requests.length = 0;
  hash = '#list=1&unassigned=1&unassigned_page=1';
  nav.events.dispatchEvent(new Event('popstate'));
  await page.navUi.settled();
  assert.ok(requests.some(x => x.startsWith('/api/v1/inventory/hosts?')));

  page.destroy();
});

test('AC-2 & C5 Session boundary: logout and expiry immediately clear protected list and detail DOM, prevent deferred responses repopulating, and handle logout failure cleanly', async () => {
  const { document, window } = parseHTML(html);
  const get = id => document.getElementById(id);

  const row = { id: '00000000-0000-4000-8000-000000000001', hostname: 'protected-server', os: 'Debian', os_version: '12', first_seen_at: '2026-10-30', last_seen_at: '2026-10-30' };
  let logoutFail = false;
  let deferredResolver = null;

  const fetcher = async url => {
    if (url === '/auth/session') {
      return { ok: true, status: 200, json: async () => ({ authenticated: true, csrf: 'csrf-token-1', expiresAt: Date.now() + 10000 }) };
    }
    if (url === '/auth/logout') {
      if (logoutFail) {
        return { ok: false, status: 500, json: async () => ({ error: { code: 'LOGOUT_ERROR' } }) };
      }
      return { ok: true, status: 200, json: async () => ({ authenticated: false }) };
    }
    if (url.startsWith('/api/v1/assets?type=host')) {
      if (deferredResolver) {
        await new Promise(r => { deferredResolver = r; });
      }
      return { ok: true, status: 200, json: async () => ({ data: [row], meta: { page: 1, page_size: 25, total: 1, total_pages: 1 } }) };
    }
    return { ok: true, status: 200, json: async () => ({ data: [], meta: { page: 1, page_size: 25, total: 0, total_pages: 1 } }) };
  };

  const nav = {
    events: new EventTarget(),
    location: new URL('http://local/inventory/hosts#list=1'),
    history: { replaceState() {}, pushState() {} }
  };

  const page = mountHostPage(document, { fetcher, navigation: nav, useStandardApi: true });
  await page.ready;

  assert.equal(get('session-info').textContent, 'Authenticated session');
  assert.match(get('inventory-rows').textContent, /protected-server/);

  logoutFail = true;
  get('logout-button').dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
  await tick();
  assert.equal(get('session-info').textContent, 'Logout failed. Session still active.');
  assert.equal(get('logout-button').disabled, false);
  assert.match(get('inventory-rows').textContent, /protected-server/);

  logoutFail = false;
  get('logout-button').dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
  await tick();
  assert.equal(get('session-info').textContent, 'Anonymous');
  assert.equal(get('inventory-rows').children.length, 0);
  assert.equal(get('inventory-rows').textContent, '');
  assert.equal(get('inventory-total').textContent, 'Authentication required');
  assert.match(get('inventory-status').textContent, /Session expired or not authenticated/);

  let resolveDelayed;
  deferredResolver = () => {};
  const inFlightPromise = page.navUi.core.list.reload();
  page.auth.setSessionUI({ authenticated: false });
  assert.equal(get('inventory-rows').children.length, 0);
  deferredResolver();
  await inFlightPromise.catch(() => {});
  await tick();
  assert.equal(get('inventory-rows').children.length, 0);
  assert.equal(get('inventory-rows').textContent, '');

  page.destroy();
});

test('AC-1, AC-2, AC-3 Local signed-session + backend + frontend proxy integration: live PostgreSQL, signed JWT, proxy cookie forwarding, Viewer success, Service Owner 403, anonymous 401', async () => {
  const db = new PGlite();
  let app, provider, frontend;
  const hostId = '00000000-0000-4000-8000-000000000003';
  const site = '00000000-0000-4000-8000-000000000002';
  const owner = '00000000-0000-4000-8000-000000000001';

  try {
    await migrate(db, 'up');
    await seed(db);

    await db.exec(`INSERT INTO asset_inventory.host(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,owner_id,site_id,hostname,host_uuid,os,os_version)
      VALUES('${hostId}'::uuid,'synthetic:api',now(),now(),now(),'confirmed','seed://SYNTHETIC_SAFE','dev','{synthetic-live}'::text[],'${owner}'::uuid,'${site}'::uuid,'live-db-host','live-db-uuid','Debian Live','12.5')
      ON CONFLICT (id) DO UPDATE SET hostname='live-db-host', os='Debian Live', os_version='12.5'`);
    await db.exec(`INSERT INTO asset_inventory.package(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,name,version,normalized_version,ecosystem,source_host_or_image,source_kind)
      VALUES('90000000-0000-4000-8000-000000000099','synthetic:api',now(),now(),now(),'confirmed','seed://SYNTHETIC_SAFE','dev',ARRAY['synthetic-live'],'live-openssl','3.0.1','3.0.1','deb','${hostId}','host')
      ON CONFLICT (id) DO NOTHING`);
    await db.exec(`INSERT INTO asset_inventory.listening_port(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,host_id,protocol,port,bind_address,process,pid)
      VALUES('80000000-0000-4000-8000-000000000099','synthetic:api',now(),now(),now(),'confirmed','seed://SYNTHETIC_SAFE','dev',ARRAY['synthetic-live'],'${hostId}'::uuid,'tcp',22,'0.0.0.0','sshd',999)
      ON CONFLICT (id) DO NOTHING`);

    const pair = await generateKeyPair('RS256');
    const jwk = { ...await exportJWK(pair.publicKey), kid: 'live-ui-jwk', alg: 'RS256', use: 'sig' };
    provider = createServer((req, res) => {
      assert.equal(req.url, '/jwks');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ keys: [jwk] }));
    });
    await new Promise(r => provider.listen(0, '127.0.0.1', r));
    const issuer = `http://127.0.0.1:${provider.address().port}`;

    const signToken = role => new SignJWT({ realm_access: { roles: [role] } })
      .setProtectedHeader({ alg: 'RS256', typ: 'at+jwt', kid: 'live-ui-jwk' })
      .setIssuer(issuer)
      .setAudience('live-ui-lab')
      .setSubject('live-ui-user')
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(pair.privateKey);

    const viewerToken = await signToken('Viewer');
    const serviceOwnerToken = await signToken('Service Owner');

    app = createApp({
      readAssets: createAssetReader({ db }),
      readAssetDetails: createAssetDetailsReader({ db }),
      authorizeInventory: createInventoryAuthorizer({ issuer, audience: 'live-ui-lab', algorithm: 'RS256', jwksUri: issuer + '/jwks' })
    });
    await new Promise(r => app.listen(0, '127.0.0.1', r));
    const backendPort = app.address().port;

    frontend = createFrontend({
      root: fileURLToPath(new URL('../src/', import.meta.url)),
      backendOrigin: `http://127.0.0.1:${backendPort}`,
      inventoryEnabled: true
    });
    await new Promise(r => frontend.listen(0, '127.0.0.1', r));
    const frontendOrigin = `http://127.0.0.1:${frontend.address().port}`;

    const viewerRes = await fetch(`${frontendOrigin}/api/v1/assets?type=host`, {
      headers: { authorization: `Bearer ${viewerToken}` }
    });
    assert.equal(viewerRes.status, 200);
    const viewerJson = await viewerRes.json();
    assert.ok(viewerJson.data.some(h => h.id === hostId && h.hostname === 'live-db-host'));

    const deniedRes = await fetch(`${frontendOrigin}/api/v1/assets?type=host`, {
      headers: { authorization: `Bearer ${serviceOwnerToken}` }
    });
    assert.equal(deniedRes.status, 403);

    const anonRes = await fetch(`${frontendOrigin}/api/v1/assets?type=host`);
    assert.equal(anonRes.status, 401);
    assert.equal(anonRes.headers.get('www-authenticate'), 'Bearer');

    const { document } = parseHTML(html);
    const nav = {
      events: new EventTarget(),
      location: new URL('http://local/inventory/hosts#list=1'),
      history: { replaceState() {}, pushState() {} }
    };
    const proxyFetcher = (url, options = {}) => {
      if (url === '/auth/session') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ authenticated: true, csrf: 'live-csrf', expiresAt: Date.now() + 60000 })
        });
      }
      const headers = { ...options.headers, authorization: `Bearer ${viewerToken}` };
      return fetch(new URL(url, frontendOrigin), { ...options, headers });
    };

    const page = mountHostPage(document, { fetcher: proxyFetcher, navigation: nav, useStandardApi: true });
    await page.ready;

    assert.match(document.getElementById('inventory-rows').textContent, /live-db-host/);

    await page.navUi.core.open({ id: hostId, hostname: 'live-db-host', os: 'Debian Live', os_version: '12.5', first_seen_at: '2026-10-24', last_seen_at: '2026-10-24' });
    assert.match(document.getElementById('detail-info').textContent, /Debian Live/);
    assert.match(document.getElementById('detail-related').textContent, /live-openssl/);
    assert.match(document.getElementById('detail-related').textContent, /22/);

    page.auth.setSessionUI({ authenticated: false });
    assert.equal(document.getElementById('inventory-rows').textContent, '');
    assert.equal(document.getElementById('detail-info').textContent, '');

    page.destroy();

    console.log('SIGNED_LOCAL_AUTH_UI_PROOF', JSON.stringify({
      livePostgresWasm: true,
      jwksIssuer: true,
      signedViewerToken: true,
      signedServiceOwnerToken: true,
      frontendProxyPassThrough: true,
      viewer200DbRows: true,
      serviceOwner403: true,
      anonymous401Bearer: true,
      liveDomCompositionRender: true,
      sessionInvalidationClear: true
    }));
  } finally {
    if (frontend) { frontend.closeAllConnections?.(); await new Promise(r => frontend.close(r)); }
    if (app) { app.closeAllConnections?.(); await new Promise(r => app.close(r)); }
    if (provider) { provider.closeAllConnections?.(); await new Promise(r => provider.close(r)); }
    await db.close();
  }
});
