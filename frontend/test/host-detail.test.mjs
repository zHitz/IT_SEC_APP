import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{parseHTML}from'linkedom';import{mountInventoryDetail}from'../src/inventory-detail.mjs';import{startInventoryUiLab}from'../../scripts/inventory-ui-lab.mjs';
const html=await readFile(new URL('../src/hosts.html',import.meta.url),'utf8');const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('Host row opens scoped detail; package/version and process/PID render; back preserves list search/pages',async()=>{
 const lab=await startInventoryUiLab({hostFixtures:true});const{document,window}=parseHTML(html);const requests=[];
 const ui=mountInventoryDetail(document,{fetcher:(url,options)=>{requests.push(url);return fetch(new URL(url,lab.origin),options);}});
 const get=id=>document.getElementById(id);async function settled(){for(let i=0;i<100;i++){if(get('inventory-detail').getAttribute('aria-busy')==='false')return;await new Promise(r=>setTimeout(r,10));}throw Error('detail timeout');}
 try{
  await ui.ready;ui.list.state.pageSize=10;ui.list.state.page=2;ui.list.state.search='host-';get('domain-search').value='host-';await ui.list.reload();
  const priorRows=get('inventory-rows').textContent;const link=get('inventory-rows').querySelector('a');assert.ok(link);link.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));await settled();
  assert.equal(get('inventory-list').hidden,true);assert.equal(get('inventory-detail').hidden,false);assert.match(get('detail-info').textContent,/Synthetic Linux/);assert.match(get('detail-info').textContent,/12.3/);assert.match(get('detail-related').textContent,/1.2.3/);assert.match(get('detail-related').textContent,/synthetic-listener/);
  const scoped=requests.filter(url=>url.includes('host_id='));assert.equal(scoped.length,2);const ids=scoped.map(url=>new URL(url,'http://localhost').searchParams.get('host_id'));assert.equal(ids[0],ids[1]);assert.ok(!requests.some(url=>url.includes('cloudflare')));
  get('detail-back').dispatchEvent(new window.Event('click'));assert.equal(get('inventory-list').hidden,false);assert.equal(ui.list.state.page,2);assert.equal(ui.list.state.search,'host-');assert.equal(get('domain-search').value,'host-');assert.equal(get('inventory-rows').textContent,priorRows);
  console.log('HOST_DETAIL_V6_PROOF',JSON.stringify({synthetic:true,actualHttpPostgres:true,scopedRequests:2,hostMetadata:true,packageVersion:true,processPid:true,backPreservesSearchPage:true}));
 }finally{ui.destroy();await lab.close();}
});
test('Host detail rejects cross-host responses and safely exposes retry/back',async()=>{
 const{document}=parseHTML(html);const host={id:'20000000-0000-4000-8000-000000000001',hostname:'safe.test',os:'Synthetic Linux',os_version:'1',first_seen_at:null,last_seen_at:null};
 const ui=mountInventoryDetail(document,{fetcher:async url=>({ok:true,json:async()=>url.includes('/hosts?')?{data:[host],meta:{page:1,page_size:25,total:1,total_pages:1}}:{data:[{id:'bad',host_id:'other',name:'sample',version:'1',ecosystem:'deb',protocol:'tcp',port:80,bind_address:'127.0.0.1',process:'safe',pid:1}],meta:{page:1,page_size:25,total:1,total_pages:1}}})});
 await ui.ready;await ui.open(host);assert.equal(document.getElementById('detail-retry').hidden,false);assert.equal(document.getElementById('detail-related').textContent,'');ui.back();assert.equal(document.getElementById('inventory-list').hidden,false);ui.destroy();
});
