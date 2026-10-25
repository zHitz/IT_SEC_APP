const provenance = 'source, first_seen_at, last_seen_at, confidence, tags';
const resources = Object.freeze({
  domains: { table: 'domain', columns: `id, fqdn, is_internal, ${provenance}`, search: 'fqdn', order: 'fqdn, id',
    flagPredicate: "EXISTS (SELECT 1 FROM asset_inventory.dns_record r WHERE r.domain = asset_inventory.domain.fqdn AND 'cloudflare:outside-known-range' = ANY(r.tags))" },
  'dns-records': { table: 'dns_record', columns: `id, domain, type, value, proxied, ttl, ${provenance}`, search: 'domain', order: 'domain, type, id',
    flagPredicate: "'cloudflare:outside-known-range' = ANY(tags)" },
  sites: { table:'site', columns:'id, name, address_summary', search:'name', order:'name, id' },
  hosts: { table: 'host', columns: 'id, site_id, hostname, os, os_version, first_seen_at, last_seen_at', search: 'hostname', order: 'hostname, id', hostScope: false },
  packages: { table: 'package', columns: 'id, name, version, ecosystem, source_host_or_image AS host_id, first_seen_at, last_seen_at', search: 'name', order: 'name, version, id', hostScope: true, predicate: "source_kind = 'host'" },
  'listening-ports': { table: 'listening_port', from: 'listening_port p JOIN asset_inventory.host h ON h.id=p.host_id', columns: 'p.id, p.host_id, h.hostname, p.protocol, p.port, p.bind_address, p.process, p.pid, p.first_seen_at, p.last_seen_at', order: 'port, protocol, id', hostScope: true, predicate: 'p.host_id IS NOT NULL' }
});
export class InventoryError extends Error { constructor(code, status = 400) { super(code); this.code = code; this.status = status; } }
export function inventoryQuery(resource, params) {
  const spec = resources[resource];
  if (!spec) throw new InventoryError('NOT_FOUND', 404);
  const allowed = new Set(['page', 'page_size', ...(spec.search ? ['search'] : []), ...(resource === 'hosts' ? ['site_id','site_assigned'] : []), ...(['hosts','domains','packages','listening-ports','dns-records'].includes(resource)?['sort','direction']:[]), ...(resource === 'listening-ports' ? ['port','process_search'] : []), ...(resource === 'dns-records' ? ['value_search'] : []), ...(spec.hostScope ? ['host_id'] : []), ...(spec.flagPredicate ? ['outside_known_range'] : [])]);
  for (const key of params.keys()) if (!allowed.has(key) || params.getAll(key).length !== 1) throw new InventoryError('INVALID_QUERY');
  function integer(key, fallback, max) {
    const raw = params.get(key); if (raw === null) return fallback;
    if (!/^[1-9]\d*$/.test(raw) || Number(raw) > max) throw new InventoryError('INVALID_QUERY');
    return Number(raw);
  }
  const page = integer('page', 1, 100000), pageSize = integer('page_size', 25, 100);
  const sorts={hosts:{hostname:'hostname',os:'os',os_version:'os_version'},domains:{hostname:'fqdn'},'dns-records':{owner:'domain',value:'value',type:'type'},packages:{name:'name',version:'version'},'listening-ports':{port:'port',pid:'pid',hostname:'hostname',process:'process'}};
  const requestedSort=params.get('sort'),direction=params.get('direction')??'asc',map=sorts[resource];if((requestedSort!==null&&(!map||!Object.hasOwn(map,requestedSort)))||!['asc','desc'].includes(direction))throw new InventoryError('INVALID_QUERY');const order=requestedSort!==null?map[requestedSort]+' '+direction+' NULLS LAST, id asc':resource==='hosts'?'hostname '+direction+' NULLS LAST, id asc':resource==='domains'?'fqdn '+direction+' NULLS LAST, id asc':spec.order;
  const values = [], where = spec.predicate ? [spec.predicate] : [];
  const search = params.get('search');
  if (search !== null) {
    if (!search.trim() || search.length > 200 || /[\u0000-\u001f\u007f]/.test(search)) throw new InventoryError('INVALID_QUERY');
    values.push(search.trim()); where.push(`strpos(lower(${spec.search}), lower($${values.length}::text)) > 0`);
  }
  const siteAssigned=params.get('site_assigned');
  if(siteAssigned!==null){if(!['true','false'].includes(siteAssigned)||params.has('site_id'))throw new InventoryError('INVALID_QUERY');where.push(siteAssigned==='false'?'site_id IS NULL':'site_id IS NOT NULL');}
  const siteId=params.get('site_id');
  if(siteId!==null){if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siteId))throw new InventoryError('INVALID_QUERY');values.push(siteId);where.push(`site_id=$${values.length}::uuid`);}
  const requestedPort=params.get('port'),processSearch=params.get('process_search');
  if(requestedPort!==null){if(!/^[1-9]\d{0,4}$/.test(requestedPort)||Number(requestedPort)>65535)throw new InventoryError('INVALID_QUERY');values.push(Number(requestedPort));where.push(`p.port=$${values.length}::int`);}
  if(processSearch!==null){if(!processSearch.trim()||processSearch.length>200||/[\u0000-\u001f\u007f]/.test(processSearch))throw new InventoryError('INVALID_QUERY');values.push(processSearch.trim());where.push(`strpos(lower(p.process),lower($${values.length}::text))>0`);}
  const valueSearch = params.get('value_search');
  if(valueSearch!==null){
    if(!valueSearch.trim()||valueSearch.length>200||/[\u0000-\u001f\u007f]/.test(valueSearch))throw new InventoryError('INVALID_QUERY');
    values.push(valueSearch.trim());where.push(`strpos(lower(value),lower($${values.length}::text))>0`);
  }
  const flagged = params.get('outside_known_range');
  if (flagged !== null) {
    if (!['true', 'false'].includes(flagged)) throw new InventoryError('INVALID_QUERY');
    where.push(`${flagged === 'false' ? 'NOT ' : ''}(${spec.flagPredicate})`);
  }
  const hostId = params.get('host_id');
  if (hostId !== null) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hostId)) throw new InventoryError('INVALID_QUERY');
    values.push(hostId); where.push(`${resource === 'packages' ? 'source_host_or_image' : 'host_id'} = $${values.length}::uuid`);
  }
  values.push(pageSize, (page - 1) * pageSize);
  // Only whitelisted identifiers enter SQL; all caller data is bound. One statement gives consistent count/page.
  const sql = `WITH filtered AS (SELECT ${spec.columns} FROM asset_inventory.${spec.from ?? spec.table}${where.length ? ` WHERE ${where.join(' AND ')}` : ''}),
    page_rows AS (SELECT * FROM filtered ORDER BY ${order} LIMIT $${values.length - 1} OFFSET $${values.length})
    SELECT (SELECT count(*)::int FROM filtered) AS total,
      COALESCE((SELECT json_agg(page_rows ORDER BY ${order}) FROM page_rows), '[]'::json) AS data`;
  return { sql, values, page, pageSize };
}
export function createInventoryReader({ db }) {
  return async (resource, params) => {
    const { sql, values, page, pageSize } = inventoryQuery(resource, params);
    const { rows } = await db.query(sql, values);
    const { total, data } = rows[0];
    return { data, meta: { page, page_size: pageSize, total, total_pages: Math.ceil(total / pageSize) } };
  };
}
