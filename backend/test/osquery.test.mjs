import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runOsqueryLab } from '../../scripts/osquery-scenario.mjs';
test('three isolated lab sources -> authenticated HTTP ingest; disk retry/restart, idempotency, safe five-table projection',async()=>{
  const proof=await runOsqueryLab({offlineMs:50,tickMs:25});
  assert.equal(proof.hosts.length,3);assert.equal(proof.freshInstallSteps.length,5);
  assert.equal(proof.offline.pending,0);assert.ok(proof.processRuns.length>=15);
  console.log('OSQUERY_LAB_FAST',JSON.stringify({synthetic:true,nativeLinux:false,nativeOsquery:false,hosts:3,offlineMs:proof.offline.actualMs,queued:proof.offline.batchesQueued,allDelivered:true}));
});


test('Host, Package and ListeningPort preserve first_seen and monotonic last_seen across repeats and stale replay',async()=>{
 const {PGlite}=await import('@electric-sql/pglite');
 const {migrate}=await import('../db/migrate.mjs');
 const {createOsqueryStore}=await import('../src/ingest/osquery-store.mjs');
 const {mkdtemp,rm,readFile}=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');const {join,resolve,dirname,basename}=await import('node:path');
 const {randomUUID}=await import('node:crypto');
 const directory=await mkdtemp(join(tmpdir(),'atlas-temporal-')),db=new PGlite();
 try{
  await migrate(db,'up');const store=createOsqueryStore({db,rawDirectory:directory,environment:'synthetic-test'});
  const firstAt=new Date(Date.now()-60000).toISOString(),lastAt=new Date().toISOString();
  const make=at=>({batch_id:randomUUID(),collected_at:at,host:{hostname:'temporal.test',host_uuid:'synthetic-temporal',os:'Synthetic Linux',os_version:'1'},packages:[{name:'sample',version:'1',ecosystem:'deb'}],listening_ports:[{port:8080,protocol:'tcp',bind_address:'192.0.2.1',pid:42,process:'synthetic-web'}],process_evidence:{non_listening_count:0,records:[]}});
  const first=make(firstAt),second=make(lastAt);await store(first);await store(second);await store(second);await store(first);
  const rows=(await db.query(`SELECT 'Host' AS entity,first_seen_at,last_seen_at,raw_ref FROM asset_inventory.host
    UNION ALL SELECT 'Package',first_seen_at,last_seen_at,raw_ref FROM asset_inventory.package
    UNION ALL SELECT 'ListeningPort',first_seen_at,last_seen_at,raw_ref FROM asset_inventory.listening_port ORDER BY entity`)).rows;
  assert.equal(rows.length,3);
  for(const row of rows){assert.equal(+row.first_seen_at,+new Date(firstAt));assert.equal(+row.last_seen_at,+new Date(lastAt));const evidence=JSON.parse(await readFile(new URL(row.raw_ref),'utf8'));assert.equal(evidence.collected_at,lastAt, row.entity+' latest raw evidence must survive stale replay');}
  console.log('OSQUERY_ALL_ENTITY_TIMESTAMPS',JSON.stringify({syntheticObservationTimes:true,repeatedAndStaleBatches:4,rows:rows.map(({entity,first_seen_at,last_seen_at})=>({entity,first_seen_at,last_seen_at})),latestRawEvidencePreserved:true}));
 }finally{await db.close();if(dirname(resolve(directory))!==resolve(tmpdir())||!basename(directory).startsWith('atlas-temporal-'))throw Error('UNSAFE_TEMP_CLEANUP');await rm(directory,{recursive:true,force:true});}
});
