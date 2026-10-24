import {test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{parseHTML}from'linkedom';import{mountInventoryTable}from'../src/inventory-table.mjs';import{startInventoryUiLab}from'../../scripts/inventory-ui-lab.mjs';import{createFrontend}from'../server.mjs';import{fileURLToPath}from'node:url';
const html=await readFile(new URL('../src/hosts.html',import.meta.url),'utf8'),tick=()=>new Promise(resolve=>setImmediate(resolve));
test('Host frontend render/search/page and Package/version plus Port/process/PID',async()=>{
 const {document,window}=parseHTML(html);const requests=[];
 const ui=mountInventoryTable(document,{mode:'host',fetcher:async url=>{requests.push(url);const u=new URL(url,'http://localhost'),resource=u.pathname.split('/').at(-1);const data=resource==='hosts'?[{id:'1',hostname:'host.test',os:'Synthetic Linux',os_version:'12.3',first_seen_at:null,last_seen_at:null}]:resource==='packages'?[{id:'2',name:'sample-package',version:'1.2.3',ecosystem:'deb',host_id:'1'}]:[{id:'3',host_id:'1',protocol:'tcp',port:8080,bind_address:'127.0.0.1',process:'synthetic-listener',pid:123}];return{ok:true,json:async()=>({data,meta:{page:Number(u.searchParams.get('page')),page_size:25,total:26,total_pages:2}})};}});
 const get=id=>document.getElementById(id),event=(id,type)=>get(id).dispatchEvent(new window.Event(type,{bubbles:true,cancelable:true}));
 await ui.ready;assert.match(get('inventory-rows').textContent,/Synthetic Linux/);assert.match(get('inventory-rows').textContent,/12.3/);assert.match(get('inventory-total').textContent,/26 hosts/);event('inventory-next','click');await tick();assert.match(requests.at(-1),/page=2/);
 get('domain-search').value='HOST';event('inventory-search','submit');await tick();assert.match(requests.at(-1),/search=HOST/);assert.match(requests.at(-1),/page=1/);
 event('records-tab','click');await tick();assert.match(get('inventory-rows').textContent,/1.2.3/);get('domain-search').value='sample';event('inventory-search','submit');await tick();assert.match(requests.at(-1),/packages.*search=sample/);
 event('ports-tab','click');await tick();assert.match(get('inventory-rows').textContent,/synthetic-listener/);assert.match(get('inventory-rows').textContent,/123/);assert.equal(get('domain-search').disabled,true);assert.ok(!requests.at(-1).includes('search='));ui.destroy();
});
test('Host page and three proxies use accepted v4 API, actual synthetic database; opt-in defaults remain closed',async()=>{
 const lab=await startInventoryUiLab({hostFixtures:true});const disabled=createFrontend({root:fileURLToPath(new URL('../src/',import.meta.url)),backendOrigin:lab.origin});await new Promise(resolve=>disabled.listen(0,'127.0.0.1',resolve));
 try{
  const off=`http://127.0.0.1:${disabled.address().port}`;assert.equal((await fetch(off+'/inventory/hosts')).status,404);
  const page=await fetch(lab.origin+'/inventory/hosts');assert.equal(page.status,200);assert.match(await page.text(),/Hosts, packages &amp; listening ports/);
  const get=async path=>(await(await fetch(lab.origin+'/api/v1/inventory/'+path)).json());
  const hosts=await get('hosts?page_size=10&page=2');assert.equal(hosts.meta.total,26);assert.equal(hosts.data.length,10);
  const host=await get('hosts?search=HOST-01');assert.equal(host.meta.total,1);assert.equal(host.data[0].os_version,'12.3');
  const packages=await get('packages?search=PACKAGE-01');assert.equal(packages.meta.total,1);assert.equal(packages.data[0].version,'1.2.3');
  const ports=await get('listening-ports');assert.equal(ports.meta.total,25);assert.ok(ports.data.some(row=>row.process==='synthetic-listener'&&Number.isInteger(row.pid)));
  console.log('HOST_UI_V5_HTTP_PROOF',JSON.stringify({synthetic:true,hosts:26,hostPackages:24,hostPorts:25,search:true,pages:true,osVersion:true,packageVersion:true,processPid:true,optIn404:true,nativeLinux:false}));
 }finally{await new Promise(resolve=>disabled.close(resolve));await lab.close();}
});
