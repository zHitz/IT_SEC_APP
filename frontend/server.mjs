import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { port } from '../backend/src/config.mjs';

export function createFrontend({ root, backendOrigin }) {
  const upstream = new URL(backendOrigin);
  if (!['http:', 'https:'].includes(upstream.protocol)) throw new Error('Invalid BACKEND_ORIGIN');
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
    if (request.method !== 'GET') { response.writeHead(405).end(); return; }
    if (request.url === '/health') {
      try {
        const result = await fetch(new URL('/health', upstream), { signal: AbortSignal.timeout(5000) });
        const data = await result.json();
        response.writeHead(result.status, { 'Content-Type': 'application/json' }).end(JSON.stringify(data));
      } catch { response.writeHead(502, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'BACKEND_UNAVAILABLE' })); }
      return;
    }
    const file = files.get(request.url);
    if (!file) { response.writeHead(404).end(); return; }
    try {
      const body = await readFile(resolve(root, file[0]));
      response.writeHead(200, { 'Content-Type': file[1] }).end(body);
    } catch { response.writeHead(503).end('Frontend build unavailable'); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.FRONTEND_HOST || !process.env.BACKEND_ORIGIN) throw new Error('FRONTEND_HOST and BACKEND_ORIGIN are required');
  const app = createFrontend({ root: fileURLToPath(new URL('./dist/', import.meta.url)), backendOrigin: process.env.BACKEND_ORIGIN });
  const listenPort = port(process.env.FRONTEND_PORT, 'FRONTEND_PORT');
  app.listen(listenPort, process.env.FRONTEND_HOST, () => console.log(`Frontend listening on configured port ${listenPort}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => app.close());
}
