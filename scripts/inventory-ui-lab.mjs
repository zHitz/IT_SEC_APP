import {PGlite} from '@electric-sql/pglite';
import {migrate,seed} from '../backend/db/migrate.mjs';
import {createApp} from '../backend/src/app.mjs';
import {createInventoryReader} from '../backend/src/inventory/reader.mjs';
import {createFrontend} from '../frontend/server.mjs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
export async function startInventoryUiLab(){
 const db=new PGlite();await migrate(db,'up');await seed(db);
 for(let index=1;index<=24;index++){
  const fqdn=`sample-${String(index).padStart(2,'0')}.test`,id=n=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
  await db.query(`INSERT INTO asset_inventory.domain(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,fqdn,is_internal)
   SELECT $1::uuid,'cloudflare',first_seen_at,last_seen_at,observed_at,'confirmed','seed://ui-v5','synthetic-test',ARRAY['synthetic'],$2,false FROM asset_inventory.domain WHERE fqdn='sample.test'`,[id(index),fqdn]);
  await db.query(`INSERT INTO asset_inventory.dns_record(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,domain,type,value,ttl)
   SELECT $1::uuid,'cloudflare',first_seen_at,last_seen_at,observed_at,'confirmed','seed://ui-v5','synthetic-test',$3::text[],$2,'A',$4,300 FROM asset_inventory.dns_record WHERE domain='sample.test'`,[id(index+100),fqdn,index%4===0?['synthetic','cloudflare:outside-known-range']:['synthetic'],index%4===0?'198.51.100.25':'192.0.2.25']);
 }
 const api=createApp({readInventory:createInventoryReader({db})});await new Promise(resolve=>api.listen(0,'127.0.0.1',resolve));
 const app=createFrontend({root:fileURLToPath(new URL('../frontend/src/',import.meta.url)),backendOrigin:`http://127.0.0.1:${api.address().port}`,inventoryEnabled:true});await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 return {origin:`http://127.0.0.1:${app.address().port}`,db,async close(){await new Promise(resolve=>app.close(resolve));await new Promise(resolve=>api.close(resolve));await db.close();}};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const lab=await startInventoryUiLab();console.log(JSON.stringify({event:'inventory_ui_lab_ready',url:lab.origin+'/inventory/domains',synthetic:true,engine:'PostgreSQL17.5WASM',domains:25,dnsRecords:25,flaggedRecords:6,cloudflareRequests:0}));
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await lab.close();process.exit(0);});
}
