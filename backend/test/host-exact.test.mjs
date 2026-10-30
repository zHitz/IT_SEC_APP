import{test}from'node:test';import assert from'node:assert/strict';import{PGlite}from'@electric-sql/pglite';import{migrate,seed}from'../db/migrate.mjs';import{createApp}from'../src/app.mjs';import{createExactInventoryReader}from'../src/inventory/exact-reader.mjs';
test('Host UUID GET lookup supports deep-link identity and unknown/invalid cases inside read-only transaction',async()=>{
 const db=new PGlite();let app;try{await migrate(db,'up');await seed(db);await db.exec('BEGIN READ ONLY');app=createApp({authorizeInventory:async()=>({subject:'synthetic-reader-test'}),readExactInventory:createExactInventoryReader({db})});await new Promise(r=>app.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.address().port}/api/v1/inventory/hosts/`,id='00000000-0000-4000-8000-000000000003';
  const response=await fetch(base+id);assert.equal(response.status,200);const row=(await response.json()).data;assert.equal(row.hostname,'sample-host-a');assert.equal(row.os_version,'1.0');assert.equal(row.id,id);
  const missing=await fetch(base+'ffffffff-ffff-ffff-ffff-ffffffffffff');assert.equal(missing.status,404);assert.equal((await missing.json()).error.code,'HOST_NOT_FOUND');
  assert.equal((await fetch(base+'bad')).status,400);assert.equal((await fetch(base+id+'?search=host')).status,400);assert.equal((await fetch(base+id+'/dns-records')).status,404);assert.equal((await fetch(base+id,{method:'POST'})).status,405);await db.exec('COMMIT');
  console.log('HOST_EXACT_V7_PROOF',JSON.stringify({synthetic:true,readOnlyTransaction:true,uuidLookup:true,osVersion:true,missing404:true,invalid400:true,noSchemaChange:true}));
 }finally{if(app)await new Promise(r=>app.close(r));await db.close();}
});
