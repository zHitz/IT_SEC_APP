import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{parseHTML}from'linkedom';import{mountHostNavigation,parseHostRoute}from'../src/host-navigation.mjs';import{startInventoryUiLab}from'../../scripts/inventory-ui-lab.mjs';
const html=await readFile(new URL('../src/hosts.html',import.meta.url),'utf8');
function navigation(hash){
 const events=new EventTarget();let stack=[{url:new URL('http://local/inventory/hosts'+hash),state:null}],index=0;
 const nav={events,get location(){return stack[index].url;}};
 nav.history={get state(){return stack[index].state;},replaceState(state,_title,url){stack[index]={url:new URL(url,stack[index].url),state};},pushState(state,_title,url){stack=stack.slice(0,index+1);stack.push({url:new URL(url,stack[index].url),state});index++;},back(){if(index>0){index--;events.dispatchEvent(new Event('popstate'));}},forward(){if(index<stack.length-1){index++;events.dispatchEvent(new Event('popstate'));}}};return nav;
}
test('Host direct fragment/reload resolves exact entity; Back/Forward preserves list context; missing/invalid IDs clear all data',async()=>{
 const lab=await startInventoryUiLab({hostFixtures:true});const id='20000000-0000-4000-8000-000000000011',nav=navigation('#host='+id+'&search=host-&page=2&page_size=10'),requests=[];let ui;
 const mount=()=>{const{document,window}=parseHTML(html);const controller=mountHostNavigation(document,{navigation:nav,fetcher:(url,options)=>{requests.push(url);return fetch(new URL(url,lab.origin),options);}});return{document,window,controller};};
 try{
  ui=mount();await ui.controller.ready;const get=id=>ui.document.getElementById(id);
  assert.equal(get('inventory-list').hidden,true);assert.equal(get('detail-title').textContent,'host-11.test');assert.match(get('detail-related').textContent,/sample-package-11/);assert.match(get('detail-related').textContent,/111/);
  assert.equal(ui.controller.core.list.state.page,2);assert.equal(get('domain-search').value,'host-');assert.ok(requests.some(x=>x==='/api/v1/inventory/hosts/'+id));
  ui.controller.destroy();ui=mount();await ui.controller.ready;assert.equal(get('detail-title').textContent,'host-11.test');assert.match(get('detail-info').textContent,/12.3/);
  ui.controller.back();await ui.controller.settled();assert.equal(get('inventory-list').hidden,false);assert.equal(ui.controller.core.list.state.page,2);assert.match(nav.location.hash,/list=1/);
  const link=[...get('inventory-rows').querySelectorAll('a')].find(x=>x.textContent==='host-12.test');assert.ok(link);link.dispatchEvent(new ui.window.Event('click',{bubbles:true,cancelable:true}));await ui.controller.settled();assert.equal(get('detail-title').textContent,'host-12.test');
  nav.history.back();await ui.controller.settled();assert.equal(get('inventory-list').hidden,false);assert.equal(get('domain-search').value,'host-');assert.equal(ui.controller.core.list.state.page,2);
  nav.history.forward();await ui.controller.settled();assert.equal(get('detail-title').textContent,'host-12.test');assert.match(get('detail-related').textContent,/112/);
  ui.controller.navigate('ffffffff-ffff-ffff-ffff-ffffffffffff');await ui.controller.settled();assert.match(get('detail-status').textContent,/Host not found/);assert.equal(get('detail-info').textContent,'');assert.equal(get('detail-related').textContent,'');
  ui.controller.navigate('not-a-uuid');await ui.controller.settled();assert.match(get('detail-status').textContent,/Invalid host link/);assert.equal(get('detail-related').textContent,'');
  console.log('HOST_NAVIGATION_V7_PROOF',JSON.stringify({synthetic:true,actualHttpPostgres:true,directLink:true,reloadNewDocument:true,exactLookup:true,backForward:true,searchPageRetained:true,missing404NoPartial:true,invalid400NoPartial:true,nativeLinux:false}));
 }finally{ui?.controller.destroy();await lab.close();}
});
test('Host fragment parser bounds list context and accepts legacy detail IDs',()=>{
 const valid=parseHostRoute({hash:'#detail=ABCDEFAB-0000-4000-8000-000000000001&search=host-&page=2&page_size=10'});assert.equal(valid.id,'abcdefab-0000-4000-8000-000000000001');assert.equal(valid.context.page,2);assert.equal(valid.context.search,'host-');
 const invalid=parseHostRoute({hash:'#host=missing&page=0&page_size=1000&search='+encodeURIComponent('x'.repeat(201))});assert.equal(invalid.context.page,1);assert.equal(invalid.context.pageSize,25);assert.equal(invalid.context.search,'');
});
