import {InventoryError,inventoryQuery} from './reader.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function createExactInventoryReader({db}){
 return async(resource,id,relation,params)=>{
  if(resource==='packages'){
   if(!uuid.test(id))throw new InventoryError('INVALID_ID');
   if(relation!=='hosts')throw new InventoryError('NOT_FOUND',404);
   for(const key of params.keys())if(!['page','page_size','search','sort','direction'].includes(key))throw new InventoryError('INVALID_QUERY');
   const sort=params.get('sort')??'hostname',direction=params.get('direction')??'asc';if(!['hostname','version'].includes(sort)||!['asc','desc'].includes(direction)||['sort','direction'].some(k=>params.getAll(k).length>1))throw new InventoryError('INVALID_QUERY');const order=sort+' '+direction+' NULLS LAST,id asc',bounds=new URLSearchParams(params);bounds.delete('sort');bounds.delete('direction');
   const {page,pageSize}=inventoryQuery('packages',bounds),search=(params.get('search')??'').trim();
   const {rows}=await db.query(`WITH owner AS (SELECT name,ecosystem FROM asset_inventory.package WHERE id=$1::uuid AND source_kind='host'),
    filtered AS (SELECT p.id,p.name,p.version,p.ecosystem,h.id AS host_id,h.hostname
     FROM asset_inventory.package p JOIN owner o ON p.name=o.name AND p.ecosystem IS NOT DISTINCT FROM o.ecosystem
     JOIN asset_inventory.host h ON h.id=p.source_host_or_image WHERE p.source_kind='host'
      AND ($2::text='' OR strpos(lower(p.name),lower($2::text))>0 OR strpos(lower(p.version),lower($2::text))>0)),
    page_rows AS (SELECT * FROM filtered ORDER BY ${order} LIMIT $3 OFFSET $4)
    SELECT EXISTS(SELECT 1 FROM owner) AS owner_exists,(SELECT row_to_json(owner) FROM owner) AS package,
      (SELECT count(*)::int FROM filtered) AS total,COALESCE((SELECT json_agg(page_rows ORDER BY ${order}) FROM page_rows),'[]'::json) AS data`,[id,search,pageSize,(page-1)*pageSize]);
   if(!rows[0].owner_exists)throw new InventoryError('PACKAGE_NOT_FOUND',404);
   return{package:rows[0].package,data:rows[0].data,meta:{page,page_size:pageSize,total:rows[0].total,total_pages:Math.ceil(rows[0].total/pageSize)}};
  }
  if(resource==='dns-records'){if(!uuid.test(id))throw new InventoryError('INVALID_ID');if(relation||[...params.keys()].length)throw new InventoryError('INVALID_QUERY');const{rows}=await db.query('SELECT id,domain,type,value,proxied,ttl,source,first_seen_at,last_seen_at,confidence,tags FROM asset_inventory.dns_record WHERE id=$1::uuid',[id]);if(!rows.length)throw new InventoryError('DNS_RECORD_NOT_FOUND',404);return{data:rows[0]};}
  if(resource==='hosts'){
   if(!uuid.test(id))throw new InventoryError('INVALID_ID');
   if(relation)throw new InventoryError('NOT_FOUND',404);
   if([...params.keys()].length)throw new InventoryError('INVALID_QUERY');
   const {rows}=await db.query('SELECT id,hostname,os,os_version,first_seen_at,last_seen_at FROM asset_inventory.host WHERE id=$1::uuid',[id]);
   if(!rows.length)throw new InventoryError('HOST_NOT_FOUND',404);
   return{data:rows[0]};
  }
  if(resource!=='domains'||(relation&&relation!=='dns-records'))throw new InventoryError('NOT_FOUND',404);
  if(!uuid.test(id))throw new InventoryError('INVALID_ID');
  const allowed=relation?new Set(['page','page_size']):new Set();
  for(const key of params.keys())if(!allowed.has(key))throw new InventoryError('INVALID_QUERY');
  if(!relation){
   const {rows}=await db.query('SELECT id,fqdn,is_internal,source,first_seen_at,last_seen_at,confidence,tags FROM asset_inventory.domain WHERE id=$1::uuid',[id]);
   if(!rows.length)throw new InventoryError('DOMAIN_NOT_FOUND',404);
   return{data:rows[0]};
  }
  const {page,pageSize}=inventoryQuery('dns-records',params);
  // One read statement preserves existence, exact owner FK join, count and page consistency.
  const {rows}=await db.query(`WITH owner AS (SELECT id,fqdn FROM asset_inventory.domain WHERE id=$1::uuid),
   filtered AS (SELECT r.id,r.domain,r.type,r.value,r.proxied,r.ttl,r.source,r.first_seen_at,r.last_seen_at,r.confidence,r.tags
    FROM asset_inventory.dns_record r JOIN owner d ON r.domain=d.fqdn),
   page_rows AS (SELECT * FROM filtered ORDER BY type,id LIMIT $2 OFFSET $3)
   SELECT EXISTS(SELECT 1 FROM owner) AS owner_exists,(SELECT count(*)::int FROM filtered) AS total,
    COALESCE((SELECT json_agg(page_rows ORDER BY type,id) FROM page_rows),'[]'::json) AS data`,[id,pageSize,(page-1)*pageSize]);
  if(!rows[0].owner_exists)throw new InventoryError('DOMAIN_NOT_FOUND',404);
  return{data:rows[0].data,meta:{page,page_size:pageSize,total:rows[0].total,total_pages:Math.ceil(rows[0].total/pageSize)}};
 };
}
