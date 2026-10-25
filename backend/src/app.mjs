import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

// Liveness only. No claim about database, collectors or production readiness.
export function createApp({ ingestOsquery, readInventory, readExactInventory } = {}) {
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
    const exactMatch=/^\/api\/v1\/inventory\/(domains|hosts|packages|dns-records)\/([^/?]+)(?:\/(dns-records|hosts))?(?:\?|$)/.exec(request.url);
    if(exactMatch&&readExactInventory){
      if(request.method!=='GET'){response.setHeader('Allow','GET');response.writeHead(405).end(JSON.stringify({error:{code:'METHOD_NOT_ALLOWED',message:'Use GET',request_id:requestId}}));return;}
      try{
        if(request.url.length>2048)throw Object.assign(Error(),{status:400,code:'INVALID_QUERY'});
        const params=new URL(request.url,'http://localhost').searchParams;
        const result=await readExactInventory(exactMatch[1],exactMatch[2],exactMatch[3],params);
        response.writeHead(200).end(JSON.stringify(result));
      }catch(error){
        const status=error.status===400?400:error.status===404?404:503;
        const code=status===503?'INVENTORY_UNAVAILABLE':error.code;
        response.writeHead(status).end(JSON.stringify({error:{code,message:status===404?'Inventory entity not found':status===400?'Invalid inventory query':'Inventory unavailable',request_id:requestId}}));
      }
      return;
    }
    const inventoryMatch = /^\/api\/v1\/inventory\/(hosts|packages|listening-ports|domains|dns-records|sites)(?:\?|$)/.exec(request.url);
    if (inventoryMatch && readInventory) {
      if (request.method !== 'GET') {
        response.setHeader('Allow', 'GET');
        response.writeHead(405).end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET', request_id: requestId } }));
        return;
      }
      try {
        if (request.url.length > 2048) throw Object.assign(Error(), { status: 400, code: 'INVALID_QUERY' });
        const url = new URL(request.url, 'http://localhost');
        const result = await readInventory(inventoryMatch[1], url.searchParams);
        response.writeHead(200).end(JSON.stringify(result));
      } catch (error) {
        const invalid = error.status === 400 && error.code === 'INVALID_QUERY';
        response.writeHead(invalid ? 400 : 503).end(JSON.stringify({ error: { code: invalid ? 'INVALID_QUERY' : 'INVENTORY_UNAVAILABLE', message: invalid ? 'Invalid inventory query' : 'Inventory unavailable', request_id: requestId } }));
      }
      return;
    }
    response.writeHead(404).end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Endpoint not found', request_id: requestId } }));
  });
  app.requestTimeout = 30000; app.headersTimeout = 10000;
  return app;
}

