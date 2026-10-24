import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

// Liveness only. No claim about database, collectors or production readiness.
export function createApp() {
  return createServer((request, response) => {
    const requestId = randomUUID();
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Request-Id', requestId);
    if (request.method === 'GET' && request.url === '/health') {
      response.writeHead(200).end(JSON.stringify({ status: 'ok', service: 'backend', scope: 'liveness' }));
      return;
    }
    response.writeHead(404).end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy endpoint', request_id: requestId } }));
  });
}
