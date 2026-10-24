import { createServer } from 'node:http';
import { once } from 'node:events';

export const id = n => n.toString(16).padStart(32, '0');
export const syntheticConfig = {
  synthetic: true, baseUrl: 'http://127.0.0.1:4401/client/v4', zoneIds: [id(1), id(2)], knownCidrs: ['192.0.2.0/24', '2001:db8:1::/48'],
  cidrVersion: 'synthetic-v1', intervalMs: 25, rawDirectory: '', environment: 'synthetic-test',
};
export async function startMock() {
  const calls = [], zones = [{ id: id(1), name: 'first.test' }, { id: id(2), name: 'second.test' }];
  const records = {
    [id(1)]: [
      { id: id(101), name: 'known.first.test', type: 'A', content: '192.0.2.10', ttl: 300, proxied: false },
      { id: id(102), name: 'outside.first.test', type: 'A', content: '198.51.100.20', ttl: 120, proxied: true },
      { id: id(103), name: 'v6.first.test', type: 'AAAA', content: '2001:db8:2::10', ttl: 300 },
      { id: id(104), name: 'alias.first.test', type: 'CNAME', content: 'known.first.test', ttl: 300 },
    ],
    [id(2)]: [
      { id: id(201), name: 'known.second.test', type: 'AAAA', content: '2001:db8:1::20', ttl: 300 },
      { id: id(202), name: 'second.test', type: 'MX', content: 'mail.second.test', priority: 10, ttl: 600 },
      { id: id(203), name: 'note.second.test', type: 'TXT', content: 'synthetic fixture only', ttl: 600 },
    ],
  };
  const state = { failZone: null, failStatus: 403 };
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    calls.push({ method: req.method, path: url.pathname, page: Number(url.searchParams.get('page')) });
    res.setHeader('content-type', 'application/json');
    if (req.method !== 'GET') { res.writeHead(405); res.end(JSON.stringify({ success: false })); return; }
    let rows, size;
    if (url.pathname === '/client/v4/zones') { rows = zones; size = 1; }
    else {
      const match = /^\/client\/v4\/zones\/([a-f0-9]{32})\/dns_records$/.exec(url.pathname);
      if (!match || !records[match[1]]) { res.writeHead(404); res.end('{}'); return; }
      if (match[1] === state.failZone) { res.writeHead(state.failStatus); res.end(JSON.stringify({ success: false })); return; }
      rows = records[match[1]]; size = 2;
    }
    const page = Number(url.searchParams.get('page'));
    if (!Number.isInteger(page) || page < 1) { res.writeHead(400); res.end('{}'); return; }
    res.end(JSON.stringify({ success: true, result: rows.slice((page - 1) * size, page * size),
      result_info: { page, per_page: size, total_pages: Math.ceil(rows.length / size), total_count: rows.length } }));
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  return { baseUrl: `http://127.0.0.1:${server.address().port}/client/v4`, calls, zones, records, state,
    close: async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } };
}
