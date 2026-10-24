import {InventoryError,inventoryQuery} from './reader.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function createExactInventoryReader({db}){
 return async(resource,id,relation,params)=>{
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
