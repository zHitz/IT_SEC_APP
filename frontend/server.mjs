import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { port } from '../backend/src/config.mjs';

export function createFrontend({ root, backendOrigin, inventoryEnabled = false }) {
  const upstream = new URL(backendOrigin);
  if (!['http:', 'https:'].includes(upstream.protocol)) throw new Error('Invalid BACKEND_ORIGIN');
  if (inventoryEnabled && !['127.0.0.1', '[::1]'].includes(upstream.hostname)) throw Error('Inventory requires loopback backend');
  const inventoryFiles = new Map([
    ['/inventory/hosts', ['hosts.html', 'text/html; charset=utf-8']],
    ['/dns-record-detail.mjs', ['dns-record-detail.mjs', 'text/javascript; charset=utf-8']],
    ['/dns-value-search.mjs', ['dns-value-search.mjs', 'text/javascript; charset=utf-8']],
    ['/flagged-domains.mjs', ['flagged-domains.mjs', 'text/javascript; charset=utf-8']],
    ['/domain-navigation.mjs', ['domain-navigation.mjs', 'text/javascript; charset=utf-8']],
    ['/package-hosts.mjs', ['package-hosts.mjs', 'text/javascript; charset=utf-8']],
    ['/port-search.mjs', ['port-search.mjs', 'text/javascript; charset=utf-8']],
    ['/site-hosts.mjs', ['site-hosts.mjs', 'text/javascript; charset=utf-8']],
    ['/host-navigation.mjs', ['host-navigation.mjs', 'text/javascript; charset=utf-8']],
    ['/inventory-detail.mjs', ['inventory-detail.mjs', 'text/javascript; charset=utf-8']],
    ['/view-bookmarks.mjs', ['view-bookmarks.mjs', 'text/javascript; charset=utf-8']],
    ['/host-page.mjs', ['host-page.mjs', 'text/javascript; charset=utf-8']],
    ['/inventory-table.mjs', ['inventory-table.mjs', 'text/javascript; charset=utf-8']],
    ['/inventory/domains', ['domains.html', 'text/html; charset=utf-8']],
    ['/inventory-page.mjs', ['inventory-page.mjs', 'text/javascript; charset=utf-8']],
    ['/domain-inventory.mjs', ['domain-inventory.mjs', 'text/javascript; charset=utf-8']]
  ]);
  const files = new Map([
    ['/', ['index.html', 'text/html; charset=utf-8']],
    ['/style.css', ['style.css', 'text/css; charset=utf-8']],
    ['/app.mjs', ['app.mjs', 'text/javascript; charset=utf-8']],
    ['/health.mjs', ['health.mjs', 'text/javascript; charset=utf-8']],
  ]);
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    const exactInventoryRoute = /^\/api\/v1\/inventory\/(?:domains\/[^/?]+(?:\/dns-records)?|hosts\/[^/?]+|dns-records\/[^/?]+|packages\/[^/?]+\/hosts)(?:\?|$)/.test(request.url);
    const standardAssetRoute = /^\/api\/v1\/(?:assets(?:\/[^/?]+)?|hosts\/[^/?]+\/ports)(?:\?|$)/.test(request.url);
    const inventoryRoute = /^\/api\/v1\/inventory\/(domains|dns-records|hosts|packages|listening-ports|sites)(?:\?|$)/.test(request.url) || exactInventoryRoute || standardAssetRoute;
    const authRoute = /^\/auth\/(?:login|callback|session|logout)(?:\?|$)/.test(request.url);
    if (inventoryEnabled && (inventoryRoute || authRoute || inventoryFiles.has(request.url)) && !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket.localAddress)) { response.writeHead(403).end(); return; }
    if (inventoryEnabled && authRoute) {
      const parsed = new URL(request.url, 'http://localhost');
      const isPost = ['/auth/login', '/auth/logout'].includes(parsed.pathname);
      const isGet = ['/auth/callback', '/auth/session'].includes(parsed.pathname);
      if ((isPost && request.method !== 'POST') || (isGet && request.method !== 'GET') || (!isPost && !isGet)) {
        response.setHeader('Allow', isPost ? 'POST' : 'GET');
        response.writeHead(405).end();
        return;
      }
      if (request.url.length > 2048) { response.writeHead(400).end(); return; }
      try {
        const target = new URL(request.url, upstream);
        const headers = {};
        if (request.headers.cookie) headers.cookie = request.headers.cookie;
        if (request.headers.origin) headers.origin = request.headers.origin;
        if (request.headers['x-csrf-token']) headers['x-csrf-token'] = request.headers['x-csrf-token'];
        if (request.headers.accept) headers.accept = request.headers.accept;

        const result = await fetch(target, {
          method: request.method,
          headers,
          signal: AbortSignal.timeout(5000),
          redirect: 'manual'
        });
        const text = await result.text();
        if (text.length > 1048576) throw Error('UPSTREAM_TOO_LARGE');

        const respHeaders = { 'Cache-Control': 'no-store' };
        if (result.headers.has('content-type')) respHeaders['Content-Type'] = result.headers.get('content-type');
        if (result.headers.has('location')) respHeaders['Location'] = result.headers.get('location');
        if (result.headers.has('x-request-id')) respHeaders['X-Request-Id'] = result.headers.get('x-request-id');
        const setCookies = result.headers.getSetCookie ? result.headers.getSetCookie() : [];
        if (setCookies.length) respHeaders['Set-Cookie'] = setCookies;

        response.writeHead(result.status, respHeaders).end(text);
      } catch {
        response.writeHead(502, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: { code: 'BACKEND_UNAVAILABLE' } }));
      }
      return;
    }
    if (request.method !== 'GET') { response.setHeader('Allow', 'GET'); response.writeHead(405).end(); return; }
    if (inventoryEnabled && inventoryRoute) {
      if (request.url.length > 2048) { response.writeHead(400).end(); return; }
      try {
        const target = new URL(request.url, upstream);
        const headers = { Accept: 'application/json' };
        if (request.headers.cookie) headers.cookie = request.headers.cookie;
        if (request.headers.authorization) headers.authorization = request.headers.authorization;
        const result = await fetch(target, { signal: AbortSignal.timeout(5000), redirect: 'error', headers });
        const text = await result.text();
        if (text.length > 1048576) throw Error('UPSTREAM_TOO_LARGE');
        const data = JSON.parse(text);
        const respHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
        if (result.headers.has('www-authenticate')) respHeaders['WWW-Authenticate'] = result.headers.get('www-authenticate');
        if (result.headers.has('x-request-id')) respHeaders['X-Request-Id'] = result.headers.get('x-request-id');
        response.writeHead(result.status, respHeaders).end(JSON.stringify(data));
      } catch { response.writeHead(502, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: { code: 'BACKEND_UNAVAILABLE' } })); }
      return;
    }
    if (request.url === '/health') {
      try {
        const result = await fetch(new URL('/health', upstream), { signal: AbortSignal.timeout(5000) });
        const data = await result.json();
        response.writeHead(result.status, { 'Content-Type': 'application/json' }).end(JSON.stringify(data));
      } catch { response.writeHead(502, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'BACKEND_UNAVAILABLE' })); }
      return;
    }
    const file = files.get(request.url) || (inventoryEnabled ? inventoryFiles.get(request.url) : undefined);
    if (!file) { response.writeHead(404).end(); return; }
    try {
      let body = await readFile(resolve(root, file[0]));
      if (file[0] === 'index.html') body = Buffer.from(body.toString('utf8').replace('<!-- inventory-nav -->', inventoryEnabled ? '<a href="/inventory/domains"><span aria-hidden="true">◎</span><span>Domain inventory</span></a><a href="/inventory/hosts"><span aria-hidden="true">▣</span><span>Host inventory</span></a>' : ''));
      response.writeHead(200, { 'Content-Type': file[1] }).end(body);
    } catch { response.writeHead(503).end('Frontend build unavailable'); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.FRONTEND_HOST || !process.env.BACKEND_ORIGIN) throw new Error('FRONTEND_HOST and BACKEND_ORIGIN are required');
  const enabled = process.env.INVENTORY_UI_ENABLED === 'true';
  if (process.env.INVENTORY_UI_ENABLED && !enabled) throw Error('Invalid INVENTORY_UI_ENABLED');
  if (enabled && !['127.0.0.1', '::1'].includes(process.env.FRONTEND_HOST)) throw Error('Inventory UI requires loopback binding');
  const app = createFrontend({ inventoryEnabled: enabled, root: fileURLToPath(new URL('./dist/', import.meta.url)), backendOrigin: process.env.BACKEND_ORIGIN });
  const listenPort = port(process.env.FRONTEND_PORT, 'FRONTEND_PORT');
  app.listen(listenPort, process.env.FRONTEND_HOST, () => console.log(`Frontend listening on configured port ${listenPort}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => app.close());
}
