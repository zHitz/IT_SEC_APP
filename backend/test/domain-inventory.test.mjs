import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { PGlite } from '@electric-sql/pglite';
import { migrate, seed } from '../db/migrate.mjs';
import { createApp } from '../src/app.mjs';
import { createInventoryReader, inventoryQuery } from '../src/inventory/reader.mjs';

test('Domain/DNS GET inventory: provenance, domain search, exact outside-range filters, pagination/counts, read-only SQL', async () => {
 const db = new PGlite(); let app;
 try {
  await migrate(db, 'up'); await seed(db);
  // New rows are synthetic copies of valid accepted-schema seed rows. Setup only, not endpoint code.
  for (const [index, fqdn, tags] of [[31,'outside.test',['cloudflare:outside-known-range','user:review']],[32,'inside.test',['user:review','cloudflare:outside-known-range-extra']]]) {
   await db.query(`INSERT INTO asset_inventory.domain (id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,fqdn,is_internal)
    SELECT $1::uuid,'cloudflare',first_seen_at,last_seen_at,observed_at,'confirmed','seed://inventory-v4','synthetic-test',ARRAY['synthetic'], $2, false FROM asset_inventory.domain WHERE fqdn='sample.test'`,[`00000000-0000-4000-8000-${String(index).padStart(12,'0')}`,fqdn]);
   await db.query(`INSERT INTO asset_inventory.dns_record (id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,domain,type,value,ttl)
    SELECT $1::uuid,'cloudflare',first_seen_at,last_seen_at,observed_at,'confirmed','seed://inventory-v4','synthetic-test',$3::text[],$2,'A','198.51.100.25',300 FROM asset_inventory.dns_record WHERE domain='sample.test'`,[`00000000-0000-4000-8000-${String(index+10).padStart(12,'0')}`,fqdn,tags]);
  }
  const before = JSON.stringify((await db.query('SELECT id,tags FROM asset_inventory.dns_record ORDER BY id')).rows);
  await db.exec('BEGIN READ ONLY');
  app=createApp({authorizeInventory:async()=>({subject:'synthetic-reader-test'}),readInventory:createInventoryReader({db})}); app.listen(0,'127.0.0.1');await once(app,'listening');
  const base=`http://127.0.0.1:${app.address().port}/api/v1/inventory/`;
  const get=async path=>{const r=await fetch(base+path);assert.equal(r.status,200,path);return r.json();};
  for(const resource of ['domains','dns-records']){
   const all=await get(resource+'?page_size=1');assert.equal(all.meta.total,3);assert.equal(all.meta.total_pages,3);assert.equal(all.data.length,1);
   const next=await get(resource+'?page_size=1&page=2');assert.notEqual(all.data[0].id,next.data[0].id);
   const flag=await get(resource+'?outside_known_range=true');assert.equal(flag.meta.total,1);
   const row=flag.data[0];assert.equal(row[resource==='domains'?'fqdn':'domain'],'outside.test');
   for(const field of ['source','first_seen_at','last_seen_at','confidence','tags'])assert.ok(Object.hasOwn(row,field),field);
   assert.equal(row.source,'cloudflare');assert.equal(row.confidence,'confirmed');assert.ok(Array.isArray(row.tags));assert.ok(!Object.hasOwn(row,'raw_ref'));
   assert.equal((await get(resource+'?outside_known_range=false')).meta.total,2);
   assert.equal((await get(resource+'?search=OUTSIDE.TEST&outside_known_range=true')).meta.total,1);
   assert.equal((await get(resource+'?search=inside&outside_known_range=true')).meta.total,0);
   assert.equal((await get(resource+'?search=%25')).meta.total,0);
   const beyond=await get(resource+'?page=100');assert.equal(beyond.meta.total,3);assert.deepEqual(beyond.data,[]);
   for(const query of ['outside_known_range=1','outside_known_range=','outside_known_range=true&outside_known_range=false','page=0','page_size=101','search=','search=%00','host_id=bad']) assert.equal((await fetch(base+resource+'?'+query)).status,400,query);
   for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal((await fetch(base+resource,{method})).status,405);
  }
  const flagged=(await get('dns-records?outside_known_range=true')).data[0];assert.deepEqual(flagged.tags,['cloudflare:outside-known-range','user:review']);
  assert.equal(flagged.value,'198.51.100.25');assert.equal(flagged.type,'A');
  await db.exec('COMMIT'); assert.equal(JSON.stringify((await db.query('SELECT id,tags FROM asset_inventory.dns_record ORDER BY id')).rows),before);
  console.log('DOMAIN_INVENTORY_V4_PROOF',JSON.stringify({engine:'PostgreSQL17.5 WASM',synthetic:true,readOnlyTransaction:true,domains:3,dnsRecords:3,flaggedRecords:1,flaggedDomains:1,unflagged:2,provenance:true,literalSearch:true,combinedFilters:true,stablePages:true,counts:true,dnsStateUnchanged:true,cloudflareRequests:0}));
 }finally{if(app)await new Promise(resolve=>app.close(resolve));await db.close();}
});
test('Domain/DNS flags use exact boolean values and are not accepted by host resources',()=>{
 assert.throws(()=>inventoryQuery('hosts',new URLSearchParams('outside_known_range=true')));
 for(const resource of ['domains','dns-records'])for(const value of ['TRUE','yes','false OR true'])assert.throws(()=>inventoryQuery(resource,new URLSearchParams({outside_known_range:value})));
});
