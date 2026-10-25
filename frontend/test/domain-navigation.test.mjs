import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{parseHTML}from'linkedom';import{mountDomainNavigation,parseDomainRoute}from'../src/domain-navigation.mjs';import{startInventoryUiLab}from'../../scripts/inventory-ui-lab.mjs';
const html=await readFile(new URL('../src/domains.html',import.meta.url),'utf8');
function navigation(hash){
 const events=new EventTarget();let stack=[{url:new URL('http://local/inventory/domains'+hash),state:null}],index=0;
 const nav={events,get location(){return stack[index].url;}};
 nav.history={get state(){return stack[index].state;},replaceState(state,_title,url){stack[index]={url:new URL(url,stack[index].url),state};},pushState(state,_title,url){stack=stack.slice(0,index+1);stack.push({url:new URL(url,stack[index].url),state});index++;},back(){if(index>0){index--;events.dispatchEvent(new Event('popstate'));}},forward(){if(index<stack.length-1){index++;events.dispatchEvent(new Event('popstate'));}}};return nav;
}
test('Domain direct fragment/reload resolves exact entity; Back/Forward preserves list context; missing/invalid IDs clear all data',async()=>{
 const lab=await startInventoryUiLab({});const id='10000000-0000-4000-8000-000000000011',nav=navigation('#domain='+id+'&search=sample-&page=2&page_size=10'),requests=[];let ui;
 const mount=()=>{const{document,window}=parseHTML(html);const controller=mountDomainNavigation(document,{navigation:nav,fetcher:(url,options)=>{requests.push(url);return fetch(new URL(url,lab.origin),options);}});return{document,window,controller};};
 try{
  ui=mount();await ui.controller.ready;const get=id=>ui.document.getElementById(id);
  assert.equal(get('inventory-list').hidden,true);assert.equal(get('detail-title').textContent,'sample-11.test');assert.match(get('detail-related').textContent,/192.0.2.25/);
  assert.equal(ui.controller.core.list.state.page,2);assert.equal(get('domain-search').value,'sample-');assert.ok(requests.some(x=>x==='/api/v1/inventory/domains/'+id));
  ui.controller.destroy();ui=mount();await ui.controller.ready;assert.equal(get('detail-title').textContent,'sample-11.test');assert.match(get('detail-info').textContent,/cloudflare/);
  ui.controller.back();await ui.controller.settled();assert.equal(get('inventory-list').hidden,false);assert.equal(ui.controller.core.list.state.page,2);assert.match(nav.location.hash,/list=1/);
  const link=[...get('inventory-rows').querySelectorAll('a')].find(x=>x.textContent==='sample-12.test');assert.ok(link);link.dispatchEvent(new ui.window.Event('click',{bubbles:true,cancelable:true}));await ui.controller.settled();assert.equal(get('detail-title').textContent,'sample-12.test');
  nav.history.back();await ui.controller.settled();assert.equal(get('inventory-list').hidden,false);assert.equal(get('domain-search').value,'sample-');assert.equal(ui.controller.core.list.state.page,2);
  nav.history.forward();await ui.controller.settled();assert.equal(get('detail-title').textContent,'sample-12.test');assert.match(get('detail-related').textContent,/198.51.100.25/);assert.match(get('detail-related').textContent,/Flagged/);
  ui.controller.navigate('ffffffff-ffff-ffff-ffff-ffffffffffff');await ui.controller.settled();assert.match(get('detail-status').textContent,/Domain not found/);assert.equal(get('detail-info').textContent,'');assert.equal(get('detail-related').textContent,'');
  ui.controller.navigate('not-a-uuid');await ui.controller.settled();assert.match(get('detail-status').textContent,/Invalid domain link/);assert.equal(get('detail-related').textContent,'');
  Object.assign(ui.controller.core.list.state,{flag:'true',page:1});ui.controller.navigate(id);await ui.controller.settled();assert.match(nav.location.hash,/outside_known_range=true/);ui.controller.back();await ui.controller.settled();assert.equal(ui.controller.core.list.state.flag,'true');assert.ok(requests.some(url=>url.includes('outside_known_range=true')));
  console.log('DOMAIN_NAVIGATION_V8_PROOF',JSON.stringify({synthetic:true,actualHttpPostgres:true,directLink:true,reloadNewDocument:true,exactLookup:true,backForward:true,searchPageRetained:true,missing404NoPartial:true,invalid400NoPartial:true,nativeLinux:false}));
 }finally{ui?.controller.destroy();await lab.close();}
});
test('Domain fragment parser bounds list context and accepts legacy detail IDs',()=>{
 const valid=parseDomainRoute({hash:'#detail=ABCDEFAB-0000-4000-8000-000000000001&search=sample-&page=2&page_size=10'});assert.equal(valid.id,'abcdefab-0000-4000-8000-000000000001');assert.equal(valid.context.page,2);assert.equal(valid.context.search,'sample-');assert.equal(parseDomainRoute({hash:'#domain=x&outside_known_range=true'}).context.flag,'true');
 const invalid=parseDomainRoute({hash:'#domain=missing&page=0&page_size=1000&search='+encodeURIComponent('x'.repeat(201))});assert.equal(invalid.context.page,1);assert.equal(invalid.context.pageSize,25);assert.equal(invalid.context.search,'');
});
