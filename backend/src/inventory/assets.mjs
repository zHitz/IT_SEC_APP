import {InventoryError} from './reader.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const assetHostColumns='id,hostname,ip_addresses,os,os_version,environment,owner_id,site_id,tags,source,observed_at,first_seen_at,last_seen_at,confidence';
export function assetQuery(params){
 const allowed=new Set(['type','env','site','owner','tag','q','page','page_size']);
 for(const key of params.keys())if(!allowed.has(key)||params.getAll(key).length!==1)throw new InventoryError('INVALID_QUERY');
 if(params.has('type')&&params.get('type')!=='host')throw new InventoryError('INVALID_QUERY');
 const number=(name,fallback,max)=>{const value=params.get(name);if(value===null)return fallback;if(!/^[1-9]\d*$/.test(value)||Number(value)>max)throw new InventoryError('INVALID_QUERY');return Number(value);};
 const page=number('page',1,100000),pageSize=number('page_size',50,200),values=[],where=[];
 for(const [name,column]of [['env','environment'],['site','site_id'],['owner','owner_id'],['tag','tags'],['q','hostname']]){
  const value=params.get(name);if(value===null)continue;
  if(!value.trim()||value.length>200||/[\u0000-\u001f\u007f]/.test(value)||(['site','owner'].includes(name)&&!uuid.test(value)))throw new InventoryError('INVALID_QUERY');
  values.push(value);const bind='$'+values.length;
  where.push(name==='tag'?`${bind}::text=ANY(tags)`:name==='q'?`strpos(lower(hostname),lower(${bind}::text))>0`:`${column}=${bind}${['site','owner'].includes(name)?'::uuid':'::text'}`);
 }
 values.push(pageSize,(page-1)*pageSize);
 const sql=`WITH filtered AS (SELECT ${assetHostColumns} FROM asset_inventory.host${where.length?' WHERE '+where.join(' AND '):''}),page_rows AS (SELECT * FROM filtered ORDER BY hostname,id LIMIT $${values.length-1} OFFSET $${values.length}) SELECT statement_timestamp() AS as_of,(SELECT count(*)::int FROM filtered) AS total,COALESCE((SELECT json_agg(page_rows ORDER BY hostname,id) FROM page_rows),'[]'::json) AS data`;
 return {sql,values,page,pageSize};
}
export function createAssetReader({db}){
 return async params=>{const {sql,values,page,pageSize}=assetQuery(params);const {rows}=await db.query(sql,values);return {data:rows[0].data.map(host=>({type:'host',...host})),meta:{page,page_size:pageSize,total:rows[0].total,total_pages:Math.ceil(rows[0].total/pageSize),as_of:rows[0].as_of}};};
}
export function createAssetDetailsReader({db}){
 return async(id,portsOnly,params)=>{
  if(!uuid.test(id))throw new InventoryError('INVALID_ID');
  for(const name of params.keys())if(!['page','page_size'].includes(name))throw new InventoryError('INVALID_QUERY');
  const {page,pageSize}=assetQuery(params);
  const columns=portsOnly?'id,host_id,protocol,port,bind_address,process,pid,source,observed_at,first_seen_at,last_seen_at,confidence':'id,name,version,ecosystem,source,observed_at,first_seen_at,last_seen_at,confidence';
  const table=portsOnly?'listening_port':'package',predicate=portsOnly?'host_id=$1::uuid':"source_kind='host' AND source_host_or_image=$1::uuid",order=portsOnly?'port,protocol,id':'name,version,id';
  const {rows}=await db.query(`WITH owner AS (SELECT ${assetHostColumns} FROM asset_inventory.host WHERE id=$1::uuid),filtered AS (SELECT ${columns} FROM asset_inventory.${table} WHERE ${predicate}),page_rows AS (SELECT * FROM filtered ORDER BY ${order} LIMIT $2 OFFSET $3) SELECT statement_timestamp() AS as_of,(SELECT row_to_json(owner) FROM owner) AS host,(SELECT count(*)::int FROM filtered) AS total,COALESCE((SELECT json_agg(page_rows ORDER BY ${order}) FROM page_rows),'[]'::json) AS data`,[id,pageSize,(page-1)*pageSize]);
  const row=rows[0];if(!row.host)throw new InventoryError('HOST_NOT_FOUND',404);
  const pagination={page,page_size:pageSize,total:row.total,total_pages:Math.ceil(row.total/pageSize)};
  return portsOnly?{data:row.data,meta:{...pagination,as_of:row.as_of,host_id:id}}:{data:{type:'host',...row.host,packages:row.data},meta:{as_of:row.as_of,packages:pagination}};
 };
}
