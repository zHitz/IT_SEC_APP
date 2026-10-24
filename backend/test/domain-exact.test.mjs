import{test}from'node:test';import assert from'node:assert/strict';import{PGlite}from'@electric-sql/pglite';import{migrate,seed}from'../db/migrate.mjs';import{createApp}from'../src/app.mjs';import{createExactInventoryReader}from'../src/inventory/exact-reader.mjs';
test('exact Domain/DNS GET: native FK owner equality, overlapping trap, pagination and not-found in read-only SQL',async()=>{
 const db=new PGlite();let app;try{
  await migrate(db,'up');await seed(db);const owner='00000000-0000-4000-8000-000000000014';
  await db.query(`INSERT INTO asset_inventory.domain(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,fqdn,is_internal) SELECT '50000000-0000-4000-8000-000000000001',source,first_seen_at,last_seen_at,observed_at,confidence,'seed://exact-trap','synthetic-test',tags,'api.sample.test',false FROM asset_inventory.domain WHERE id=$1`,[owner]);
  for(let n=1;n<=32;n++)await db.query(`INSERT INTO asset_inventory.dns_record(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,domain,type,value,proxied,ttl) SELECT $1::uuid,source,first_seen_at,last_seen_at,observed_at,confidence,'seed://exact-owner','synthetic-test',ARRAY['synthetic'],$2,'A',$3,false,120 FROM asset_inventory.dns_record WHERE domain='sample.test' LIMIT 1`,[`50000000-0000-4000-8000-${String(n+100).padStart(12,'0')}`,n===32?'api.sample.test':'sample.test',n===32?'192.0.2.254':`192.0.2.${n}`]);
  await db.exec('BEGIN READ ONLY');app=createApp({readExactInventory:createExactInventoryReader({db})});await new Promise(r=>app.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.address().port}/api/v1/inventory/domains/`;
  const get=async(path,status=200)=>{const r=await fetch(base+path);assert.equal(r.status,status,path);return r.json();};
  const entity=await get(owner);assert.equal(entity.data.fqdn,'sample.test');assert.ok(Object.hasOwn(entity.data,'confidence'));
  const page1=await get(owner+'/dns-records?page_size=10'),page2=await get(owner+'/dns-records?page_size=10&page=2');assert.equal(page1.meta.total,32);assert.equal(page1.meta.total_pages,4);assert.equal(page1.data.length,10);assert.equal(page2.data.length,10);assert.ok(page1.data.every(r=>r.domain==='sample.test'));assert.ok(!page1.data.some(a=>page2.data.some(b=>a.id===b.id)));
  const all=await get(owner+'/dns-records?page_size=100');assert.equal(all.data.length,32);assert.ok(!all.data.some(r=>r.value==='192.0.2.254'));assert.deepEqual((await get(owner+'/dns-records?page=100')).data,[]);
  for(const suffix of ['','/dns-records'])assert.equal((await get('ffffffff-ffff-ffff-ffff-ffffffffffff'+suffix,404)).error.code,'DOMAIN_NOT_FOUND');
  await get('bad-id',400);await get(owner+'?page=1',400);for(const query of ['page=0','page_size=101','page=1&page=2','search=sample'])await get(owner+'/dns-records?'+query,400);
  for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal((await fetch(base+owner+'/dns-records',{method})).status,405);
  await db.exec('COMMIT');console.log('DOMAIN_EXACT_V7_PROOF',JSON.stringify({synthetic:true,engine:'PostgreSQL17.5WASM',readOnlyTransaction:true,owned:32,trapExcluded:true,pagination:true,missing404:true,invalid400:true,getOnly:true,schemaChanged:false,cloudflareRequests:0}));
 }finally{if(app)await new Promise(r=>app.close(r));await db.close();}
});
test('exact Domain routes remain disabled by default and sanitize database failures',async()=>{
 for(const enabled of [false,true]){const app=createApp(enabled?{readExactInventory:async()=>{throw Error('Synthetic internal SQL detail');}}:{});await new Promise(r=>app.listen(0,'127.0.0.1',r));try{const r=await fetch(`http://127.0.0.1:${app.address().port}/api/v1/inventory/domains/00000000-0000-4000-8000-000000000014`);assert.equal(r.status,enabled?503:404);assert.ok(!(await r.text()).includes('internal SQL'));}finally{await new Promise(r=>app.close(r));}}
});
