import {PGlite} from '@electric-sql/pglite';
import {migrate,seed} from '../backend/db/migrate.mjs';
import {createApp} from '../backend/src/app.mjs';
import {createInventoryReader} from '../backend/src/inventory/reader.mjs';
import {createFrontend} from '../frontend/server.mjs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
export async function startInventoryUiLab({hostFixtures=false}={}){
 const db=new PGlite();await migrate(db,'up');await seed(db);
 for(let index=1;index<=24;index++){
  const fqdn=`sample-${String(index).padStart(2,'0')}.test`,id=n=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
  await db.query(`INSERT INTO asset_inventory.domain(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,fqdn,is_internal)
   SELECT $1::uuid,'cloudflare',first_seen_at,last_seen_at,observed_at,'confirmed','seed://ui-v5','synthetic-test',ARRAY['synthetic'],$2,false FROM asset_inventory.domain WHERE fqdn='sample.test'`,[id(index),fqdn]);
  await db.query(`INSERT INTO asset_inventory.dns_record(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,domain,type,value,ttl)
   SELECT $1::uuid,'cloudflare',first_seen_at,last_seen_at,observed_at,'confirmed','seed://ui-v5','synthetic-test',$3::text[],$2,'A',$4,300 FROM asset_inventory.dns_record WHERE domain='sample.test'`,[id(index+100),fqdn,index%4===0?['synthetic','cloudflare:outside-known-range']:['synthetic'],index%4===0?'198.51.100.25':'192.0.2.25']);
 }
 if(hostFixtures)for(let index=1;index<=24;index++){
  const id=n=>`20000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
  await db.query(`INSERT INTO asset_inventory.host(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,hostname,host_uuid,os,os_version)
   SELECT $1::uuid,'osquery',first_seen_at,last_seen_at,observed_at,'confirmed','seed://host-ui-v5','synthetic-test',ARRAY['synthetic'],$2,$2,'Synthetic Linux','12.3' FROM asset_inventory.host LIMIT 1`,[id(index),`host-${String(index).padStart(2,'0')}.test`]);
  await db.query(`INSERT INTO asset_inventory.package(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,name,version,normalized_version,ecosystem,source_host_or_image,source_kind)
   SELECT $1::uuid,'osquery',first_seen_at,last_seen_at,observed_at,'confirmed','seed://host-ui-v5','synthetic-test',ARRAY['synthetic'],$2,'1.2.3','1.2.3','deb',$3::uuid,'host' FROM asset_inventory.package LIMIT 1`,[id(index+100),`sample-package-${String(index).padStart(2,'0')}`,id(index)]);
  await db.query(`INSERT INTO asset_inventory.listening_port(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,host_id,protocol,port,bind_address,process,pid)
   SELECT $1::uuid,'osquery',first_seen_at,last_seen_at,observed_at,'confirmed','seed://host-ui-v5','synthetic-test',ARRAY['synthetic'],$2::uuid,'tcp',$3,'127.0.0.1','synthetic-listener',$4 FROM asset_inventory.listening_port LIMIT 1`,[id(index+200),id(index),8000+index,100+index]);
 }
 const api=createApp({readInventory:createInventoryReader({db})});await new Promise(resolve=>api.listen(0,'127.0.0.1',resolve));
 const app=createFrontend({root:fileURLToPath(new URL('../frontend/src/',import.meta.url)),backendOrigin:`http://127.0.0.1:${api.address().port}`,inventoryEnabled:true});await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 return {origin:`http://127.0.0.1:${app.address().port}`,db,async close(){await new Promise(resolve=>app.close(resolve));await new Promise(resolve=>api.close(resolve));await db.close();}};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const lab=await startInventoryUiLab({hostFixtures:process.argv.includes('--hosts')});console.log(JSON.stringify({event:'inventory_ui_lab_ready',url:lab.origin+(process.argv.includes('--hosts')?'/inventory/hosts':'/inventory/domains'),synthetic:true,engine:'PostgreSQL17.5WASM',domains:25,dnsRecords:25,flaggedRecords:6,cloudflareRequests:0}));
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await lab.close();process.exit(0);});
}
