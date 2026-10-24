import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

// Liveness only. No claim about database, collectors or production readiness.
export function createApp({ ingestOsquery } = {}) {
  const app = createServer(async (request, response) => {
    const requestId = randomUUID();
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Request-Id', requestId);
    if (request.method === 'GET' && request.url === '/health') {
      response.writeHead(200).end(JSON.stringify({ status: 'ok', service: 'backend', scope: 'liveness' }));
      return;
    }
    if (request.method === 'POST' && request.url === '/api/v1/ingest/osquery' && ingestOsquery) {
      try { const result = await ingestOsquery(request); response.writeHead(200).end(JSON.stringify(result)); }
      catch (error) {
        const status = [400,401,403,413,415,422].includes(error.status) ? error.status : 503;
        response.writeHead(status).end(JSON.stringify({ error: { code: status === 503 ? 'INGEST_UNAVAILABLE' : error.code, message: 'Batch was not accepted', request_id: requestId } }));
      }
      return;
    }
    response.writeHead(404).end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Endpoint not found', request_id: requestId } }));
  });
  app.requestTimeout = 30000; app.headersTimeout = 10000;
  return app;
}
