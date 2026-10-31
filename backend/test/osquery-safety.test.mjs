import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { resolve, join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { DurableQueue } from '../../collectors/osquery/queue.mjs';
import { validateBatch } from '../src/ingest/osquery-model.mjs';
import { createOsqueryRoute } from '../src/ingest/osquery-route.mjs';
import { queries } from '../../collectors/osquery/queries.mjs';

const token='synthetic-security-test-token';
const batch=()=>({batch_id:randomUUID(),collected_at:new Date().toISOString(),host:{hostname:'synthetic.test',host_uuid:'synthetic-security-host',os:'Synthetic Linux',os_version:'1'},packages:[{name:'sample',version:'1.0',ecosystem:'deb'}],listening_ports:[{port:8080,protocol:'tcp',bind_address:'192.0.2.1',pid:1,process:'synthetic-web'}],process_evidence:{non_listening_count:1,records:[{pid:2,name:'synthetic-worker'}]}});
function request(value,auth=`Bearer ${token}`){const req=Readable.from([Buffer.from(typeof value==='string'?value:JSON.stringify(value))]);req.headers={authorization:auth,'content-type':'application/json'};return req;}
test('ingest rejects unknown credential, forged host, malformed/oversized/sensitive payload without touching store',async()=>{
 let writes=0;const store=async b=>{writes++;return {accepted:true,batch_id:b.batch_id,host_id:'synthetic'};};
 const route=createOsqueryRoute({store,tokens:{'synthetic-security-host':token},log:()=>{}});
 await assert.rejects(route(request(batch(),'Bearer incorrect-synthetic-token')),e=>e.status===401);
 const forged=batch();forged.host.host_uuid='another-host';await assert.rejects(route(request(forged)),e=>e.status===403);
 await assert.rejects(route(request('{bad-json')),e=>e.status===400);
 const bad=batch();bad.packages[0].version='';await assert.rejects(route(request(bad)),e=>e.status===422);
 const sensitive=batch();sensitive.process_evidence.records[0].cmdline='FORBIDDEN_SYNTHETIC_CANARY';await assert.rejects(route(request(sensitive)),e=>e.status===422);
 const big=createOsqueryRoute({store,tokens:{'synthetic-security-host':token},maxBytes:32,log:()=>{}});
 await assert.rejects(big(request(batch())),e=>e.status===413);assert.equal(writes,0);
 assert.equal((await route(request(batch()))).accepted,true);assert.equal(writes,1);
});
test('queue survives re-instantiation, refuses overflow without eviction, rejects unsafe destination',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'atlas-queue-test-'));
 try{
  const value=batch();const bytes=Buffer.byteLength(JSON.stringify(value));
  const queue=new DurableQueue({directory,maxBytes:bytes+1});await queue.enqueue(value);
  const file=(await queue.files())[0];const contents=await readFile(join(directory,file),'utf8');
  await assert.rejects(queue.enqueue(batch()),/QUEUE_FULL_BACKPRESSURE/);
  const restarted=new DurableQueue({directory});assert.equal((await restarted.files()).length,1);
  assert.equal(await readFile(join(directory,file),'utf8'),contents);
  await assert.rejects(restarted.flush({endpoint:'http://outside.example.test/api/v1/ingest/osquery',token}),/INGEST_CONFIG/);
  assert.equal((await restarted.files()).length,1);
 }finally{if(dirname(resolve(directory))!==resolve(tmpdir())||!basename(directory).startsWith('atlas-queue-test-'))throw Error('UNSAFE_TEMP_CLEANUP');await rm(directory,{recursive:true,force:true});}
});
test('fixed collector projections are SELECT-only and exclude sensitive columns',()=>{
 assert.deepEqual(Object.keys(queries),['system_info','os_version','packages','listening_ports','interface_addresses','processes']);
 assert.equal(queries.interface_addresses,'SELECT interface, address, mask FROM interface_addresses');
 for(const [table,sql]of Object.entries(queries)){
  assert.match(sql,new RegExp(`^SELECT [a-z_, ]+ FROM ${table}$`));
  assert.doesNotMatch(sql,/\*|cmdline|environ|password|token|path|file|history|;/i);
 }
 const invalid=batch();invalid.host.env='FORBIDDEN_SYNTHETIC_CANARY';assert.throws(()=>validateBatch(invalid));
});
