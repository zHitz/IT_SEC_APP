import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {migrate} from '../db/migrate.mjs';
import {createOsqueryStore} from '../src/ingest/osquery-store.mjs';
import {validateBatch,normalizeInterface} from '../src/ingest/osquery-model.mjs';
const make = at => ({batch_id:randomUUID(),collected_at:at,host:{hostname:'ip.test',host_uuid:'synthetic-ip',os:'Synthetic',os_version:'1'},packages:[],listening_ports:[],process_evidence:{non_listening_count:0,records:[]}});
const row = (address='192.0.2.9',mask='255.255.255.0') => ({interface:'eth0',address,mask});
test('IP literal normalization and strict network payload bounds',()=>{
 assert.deepEqual(normalizeInterface(row()),{interface:'eth0',address:'192.0.2.9',cidr:'192.0.2.0/24'});
 assert.equal(normalizeInterface(row('2001:0db8::9','ffff:ffff:ffff:ffff::')).cidr,'2001:db8::/64');
 for(const network of [[row('bad')],[row('192.0.2.9','255.0.255.0')],[row('::1','255.255.255.0')],[{...row(),secret:'forbidden'}],Array(257).fill(row())]) assert.throws(()=>validateBatch({...make(new Date().toISOString()),network_interfaces:network}),/INVALID_PAYLOAD/);
});
test('transactional IP snapshots preserve legacy, identity, first seen and monotonic replay',async()=>{
 const db=new PGlite(),directory=await mkdtemp(join(tmpdir(),'atlas-s2-ip-'));
 try {
  await migrate(db,'up');const store=createOsqueryStore({db,rawDirectory:directory});
  const early=new Date(Date.now()-120000).toISOString(),late=new Date(Date.now()-60000).toISOString();
  const first={...make(early),network_interfaces:[row(),row('2001:db8::9','ffff:ffff:ffff:ffff::')]};
  const ack=await store(first);await store(first);
  const second={...make(late),network_interfaces:[row('192.0.2.10')]};await store(second);await store(first);
  let host=(await db.query('SELECT * FROM asset_inventory.host')).rows[0];assert.equal(host.id,ack.host_id);assert.deepEqual(host.ip_addresses,['192.0.2.10']);assert.equal(+host.first_seen_at,+new Date(early));
  await store(make(new Date().toISOString()));host=(await db.query('SELECT * FROM asset_inventory.host')).rows[0];assert.deepEqual(host.ip_addresses,['192.0.2.10']);
  assert.equal((await db.query('SELECT count(*)::int n FROM asset_inventory.network_interface')).rows[0].n,3);
  const empty={...make(new Date(Date.now()+1000).toISOString()),network_interfaces:[]};await store(empty);assert.deepEqual((await db.query('SELECT ip_addresses FROM asset_inventory.host')).rows[0].ip_addresses,[]);
  assert.equal((await db.query('SELECT count(*)::int n FROM asset_inventory.network_interface')).rows[0].n,3);
  const invalid={...make(new Date().toISOString()),network_interfaces:[row('bad')]};await assert.rejects(store(invalid),/INVALID_PAYLOAD/);
  console.log('S2_IP_DB_PROOF',JSON.stringify({hostId:ack.host_id,dualStack:true,interfaces:3,legacyPreserved:true,staleReplayIgnored:true,emptyClearsCurrentOnly:true}));
 } finally {await db.close();}
});
import {createServer} from 'node:http';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {DatabaseSync} from 'node:sqlite';
import {createApp} from '../src/app.mjs';
import {createOsqueryRoute} from '../src/ingest/osquery-route.mjs';
import {createAssetReader,createAssetDetailsReader} from '../src/inventory/assets.mjs';
import {createInventoryAuthorizer} from '../src/auth/oidc.mjs';
import {createLabHost} from './support/osquery-lab.mjs';
import {readSource,buildBatches} from '../../collectors/osquery/source.mjs';
import {DurableQueue} from '../../collectors/osquery/queue.mjs';
test('read-only source to durable queue authenticated HTTP PostgreSQL and signed inventory APIs',async()=>{
 const db=new PGlite(),directory=await mkdtemp(join(tmpdir(),'atlas-s2-http-'));let app,provider;
 try {
  await migrate(db,'up');const sourceFile=join(directory,'source.sqlite');createLabHost(sourceFile,1);
  const sourceDb=new DatabaseSync(sourceFile);sourceDb.exec("CREATE TABLE interface_addresses(interface TEXT,address TEXT,mask TEXT,secret TEXT); INSERT INTO interface_addresses VALUES('eth0','192.0.2.11','255.255.255.0','FORBIDDEN_SYNTHETIC_CANARY'),('eth0','2001:db8::11','ffff:ffff:ffff:ffff::','FORBIDDEN_SYNTHETIC_CANARY')");sourceDb.close();
  const config={sourceMode:'sqlite-lab',labDatabase:sourceFile,ecosystem:'deb',maxBatchRows:1};const data=await readSource(config);
  assert.ok(!JSON.stringify(data).includes('FORBIDDEN_SYNTHETIC_CANARY'));const batches=buildBatches(data,config);assert.ok(batches.length>1);assert.ok(batches.every(b=>b.network_interfaces.length===2));
  const store=createOsqueryStore({db,rawDirectory:join(directory,'raw')});const collectorToken='synthetic-s2-collector-token';
  const pair=await generateKeyPair('RS256'),jwk={...await exportJWK(pair.publicKey),kid:'s2',alg:'RS256',use:'sig'};
  provider=createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({keys:[jwk]}));});await new Promise(r=>provider.listen(0,'127.0.0.1',r));const issuer=`http://127.0.0.1:${provider.address().port}`;
  const viewer=await new SignJWT({realm_access:{roles:['Viewer']}}).setProtectedHeader({alg:'RS256',typ:'at+jwt',kid:'s2'}).setIssuer(issuer).setAudience('s2-lab').setSubject('synthetic').setIssuedAt().setExpirationTime('5m').sign(pair.privateKey);
  app=createApp({ingestOsquery:createOsqueryRoute({store,tokens:{'synthetic-host-1':collectorToken},log:()=>{}}),readAssets:createAssetReader({db}),readAssetDetails:createAssetDetailsReader({db}),authorizeInventory:createInventoryAuthorizer({issuer,audience:'s2-lab',algorithm:'RS256',jwksUri:issuer+'/jwks'})});await new Promise(r=>app.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.address().port}`;
  const queue=new DurableQueue({directory:join(directory,'queue')});for(const batch of batches)await queue.enqueue(batch);
  assert.equal((await queue.flush({endpoint:base+'/api/v1/ingest/osquery',token:collectorToken})).pending,0);
  const get=async path=>{const res=await fetch(base+path,{headers:{authorization:'Bearer '+viewer}});assert.equal(res.status,200);return res.json();};
  const list=await get('/api/v1/assets');assert.equal(list.data.length,1);const host=list.data[0];assert.deepEqual(host.ip_addresses,['192.0.2.11','2001:db8::11']);assert.equal(host.hostname,'linux-simulator-1');assert.equal(host.source,'osquery');assert.equal(Date.parse(host.observed_at),Date.parse(batches[0].collected_at));
  const detail=await get('/api/v1/assets/'+host.id);assert.deepEqual(detail.data.ip_addresses,host.ip_addresses);assert.equal(detail.data.os,'Synthetic Debian Linux lab (not a Linux kernel)');
  const post=async batch=>fetch(base+'/api/v1/ingest/osquery',{method:'POST',headers:{authorization:'Bearer '+collectorToken,'content-type':'application/json'},body:JSON.stringify(batch)});
  for(const invalid of [{...batches[0],network_interfaces:[{...row(),cmdline:'forbidden'}]},{...batches[0],network_interfaces:Array(257).fill(row())}])assert.equal((await post(invalid)).status,422);
  assert.equal((await post({...batches[0],host:{...batches[0].host,host_uuid:'another-host'}})).status,403);assert.equal((await db.query('SELECT count(*)::int n FROM asset_inventory.host')).rows[0].n,1);
  const failedDb=new DatabaseSync(sourceFile);failedDb.exec('DROP TABLE interface_addresses');failedDb.close();const failedData=await readSource(config);assert.equal(Object.hasOwn(failedData,'interface_addresses'),false);
  for(const batch of buildBatches(failedData,config,new Date(Date.now()+1000).toISOString()))await store(batch);assert.deepEqual((await get('/api/v1/assets/'+host.id)).data.ip_addresses,host.ip_addresses);
  const failingStore=createOsqueryStore({db:{query:async(sql,args)=>{if(sql.includes('INSERT INTO asset_inventory.network_interface'))throw Error('SYNTHETIC_ROLLBACK');return db.query(sql,args);}},rawDirectory:join(directory,'rollback')});
  const rollback={...batches[0],batch_id:randomUUID(),collected_at:new Date(Date.now()+2000).toISOString(),network_interfaces:[row('192.0.2.99')]};await assert.rejects(failingStore(rollback),/SYNTHETIC_ROLLBACK/);assert.deepEqual((await get('/api/v1/assets/'+host.id)).data.ip_addresses,host.ip_addresses);
  console.log('S2_IP_HTTP_PROOF',JSON.stringify({synthetic:true,source:'SQLite read-only projection',postgres:'PGlite',dualStack:true,splitBatches:batches.length,exactAckDrained:true,signedViewerListDetail:true,wrongHost403:true,invalidNetwork422:true,failedNetworkPreserves:true,rollbackPreserves:true,hostId:host.id}));
 }finally{if(app)await new Promise(r=>app.close(r));if(provider)await new Promise(r=>provider.close(r));await db.close();}
});
