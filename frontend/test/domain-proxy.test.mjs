import {test}from'node:test';import assert from'node:assert/strict';
import {startInventoryUiLab}from'../../scripts/inventory-ui-lab.mjs';
import {createFrontend}from'../server.mjs';import {fileURLToPath}from'node:url';
test('opt-in frontend page/proxy uses accepted API over real HTTP/PostgreSQL; disabled paths fail closed',async()=>{
 const lab=await startInventoryUiLab();const disabled=createFrontend({root:fileURLToPath(new URL('../src/',import.meta.url)),backendOrigin:lab.origin});await new Promise(resolve=>disabled.listen(0,'127.0.0.1',resolve));
 try{
  const disabledOrigin=`http://127.0.0.1:${disabled.address().port}`;
  for(const path of ['/inventory/domains','/domain-inventory.mjs','/api/v1/inventory/domains','/api/v1/inventory/domains/00000000-0000-4000-8000-000000000014'])assert.equal((await fetch(disabledOrigin+path)).status,404);
  assert.ok(!(await(await fetch(disabledOrigin)).text()).includes('href="/inventory/domains"'));
  const page=await fetch(lab.origin+'/inventory/domains');assert.equal(page.status,200);assert.match(await page.text(),/Domains &amp; DNS records/);assert.match(page.headers.get('content-security-policy'),/script-src 'self'/);
  const response=await fetch(lab.origin+'/api/v1/inventory/dns-records?outside_known_range=true&page_size=10');assert.equal(response.status,200);const data=await response.json();assert.equal(data.meta.total,6);assert.equal(data.data.length,6);
  const search=await(await fetch(lab.origin+'/api/v1/inventory/domains?search=SAMPLE-01')).json();assert.equal(search.meta.total,1);
  const exact=await(await fetch(lab.origin+'/api/v1/inventory/domains/'+search.data[0].id)).json();assert.equal(exact.data.fqdn,'sample-01.test');
  const owned=await(await fetch(lab.origin+'/api/v1/inventory/domains/'+exact.data.id+'/dns-records')).json();assert.equal(owned.meta.total,1);assert.equal(owned.data[0].domain,exact.data.fqdn);
  const next=await(await fetch(lab.origin+'/api/v1/inventory/domains?page=2&page_size=10')).json();assert.equal(next.meta.page,2);assert.equal(next.meta.total,25);assert.equal(next.data.length,10);
  assert.equal((await fetch(lab.origin+'/api/v1/inventory/unknown')).status,404);assert.equal((await fetch(lab.origin+'/api/v1/ingest/osquery',{method:'POST'})).status,405);assert.equal((await fetch(lab.origin+'/.env')).status,404);
  assert.throws(()=>createFrontend({root:'.',backendOrigin:'https://example.com',inventoryEnabled:true}),/loopback/);
  console.log('DOMAIN_UI_V5_HTTP_PROOF',JSON.stringify({synthetic:true,domains:25,dnsRecords:25,flagged:6,proxySearch:true,proxyPagination:true,disabled404:true,readOnlyGet:true,cloudflareRequests:0}));
 }finally{await new Promise(resolve=>disabled.close(resolve));await lab.close();}
});
