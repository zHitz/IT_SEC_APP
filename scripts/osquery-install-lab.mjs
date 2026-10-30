// Explicit synthetic install guide runner: no Linux kernel or real osquery claim.
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';
import { createLabHost, labFingerprint } from '../backend/test/support/osquery-lab.mjs';
import { migrate } from '../backend/db/migrate.mjs';
import { createOsqueryRoute } from '../backend/src/ingest/osquery-route.mjs';
import { createOsqueryStore } from '../backend/src/ingest/osquery-store.mjs';
import { createApp } from '../backend/src/app.mjs';
const root=resolve('var/osquery/fresh-install-lab'),file=join(root,'host.sqlite'),step=Number(process.argv[2]);
const read=async name=>JSON.parse(await readFile(join(root,name),'utf8'));
const save=async(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n');
if(step===1){
 try{await stat(root);throw Error('LAB_ALREADY_EXISTS_USE_A_FRESH_CHECKOUT');}catch(error){if(error.code!=='ENOENT')throw error;}
 await mkdir(root,{recursive:true});const host=createLabHost(file,4);await save('host.json',host);console.log('STEP1 PASS: distinct fresh simulator created; NOT a Linux kernel/osquery installation');
}else if(step===2){
 await save('baseline.json',{sha256:await labFingerprint(file),scope:'Entire immutable simulator including packages/services/network/firewall/config'});console.log('STEP2 PASS: synthetic before-state recorded');
}else if(step===3){
 await save('collector.json',{sourceMode:'sqlite-lab',labDatabase:file,ecosystem:'deb',queueDirectory:join(root,'queue'),maxQueueBytes:67108864,maxBatchRows:2,collectIntervalMs:60000,sendIntervalMs:15000,queryTimeoutMs:5000,timeoutMs:3000,backoffMs:10,attempts:1});console.log('STEP3 PASS: collection,queue,batch,retry parameters configured');
}else if(step===4){
 const host=await read('host.json'),config=await read('collector.json'),db=new PGlite(join(root,'database'));
 let app;
 try{
  await migrate(db,'up');const token='synthetic-fresh-install-token';
  app=createApp({ingestOsquery:createOsqueryRoute({tokens:{[host.uuid]:token},store:createOsqueryStore({db,rawDirectory:join(root,'raw'),environment:'synthetic-lab'}),log:()=>{}})});
  app.listen(0,'127.0.0.1');await once(app,'listening');config.endpoint=`http://127.0.0.1:${app.address().port}/api/v1/ingest/osquery`;await save('collector.json',config);
  const child=spawn(process.execPath,['collectors/osquery/main.mjs','--once'],{cwd:resolve('.'),windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,OSQUERY_COLLECTOR_CONFIG:join(root,'collector.json'),OSQUERY_INGEST_TOKEN:token}});
  let stdout='';child.stdout.on('data',data=>{stdout+=data;});child.stderr.resume();const[code]=await once(child,'close');if(code!==0)throw Error('COLLECTOR_CHILD_FAILED');
  await save('delivery.json',stdout.trim().split('\n').map(line=>JSON.parse(line)));console.log('STEP4 PASS: fresh collector process delivered authenticated HTTP batches');
 }finally{if(app){app.closeAllConnections();await new Promise(resolve=>app.close(resolve));}await db.close();}
}else if(step===5){
 const db=new PGlite(join(root,'database'));
 try{
  const host=await read('host.json'),baseline=await read('baseline.json');
  const rows=(await db.query(`SELECT h.hostname,h.os,h.os_version,count(DISTINCT p.id)::int AS packages,count(DISTINCT l.id)::int AS listening_ports FROM asset_inventory.host h LEFT JOIN asset_inventory.package p ON p.source_host_id=h.id LEFT JOIN asset_inventory.listening_port l ON l.host_id=h.id WHERE h.host_uuid=$1 GROUP BY h.id`,[host.uuid])).rows;
  if(rows.length!==1||rows[0].packages!==2||rows[0].listening_ports!==1||await labFingerprint(file)!==baseline.sha256)throw Error('LAB_ACCEPTANCE_FAILED');
  await mkdir('Docs/evidence/S0-003',{recursive:true});await writeFile('Docs/evidence/S0-003/fresh-install.json',JSON.stringify({synthetic:true,nativeLinux:false,nativeOsquery:false,steps:5,baseline,afterSha256:await labFingerprint(file),inventory:rows,delivery:await read('delivery.json')},null,2)+'\n');
  console.log('STEP5 PASS: queried2packages/1port and unchanged simulated host state; evidence saved');
 }finally{await db.close();}
}else throw Error('Expected step1..5');
