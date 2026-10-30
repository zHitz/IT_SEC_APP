import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{parseHTML}from'linkedom';import{mountDomainNavigation}from'../src/domain-navigation.mjs';import{startInventoryUiLab}from'../../scripts/inventory-ui-lab.mjs';
function navigation(hash){
 const events=new EventTarget();let stack=[{url:new URL('http://local/inventory/domains'+hash),state:null}],index=0;
 const nav={events,get location(){return stack[index].url;}};
 nav.history={get state(){return stack[index].state;},replaceState(state,_title,url){stack[index]={url:new URL(url,stack[index].url),state};},pushState(state,_title,url){stack=stack.slice(0,index+1);stack.push({url:new URL(url,stack[index].url),state});index++;},back(){if(index>0){index--;events.dispatchEvent(new Event('popstate'));}},forward(){if(index<stack.length-1){index++;events.dispatchEvent(new Event('popstate'));}}};return nav;
}
const html=await readFile(new URL('../src/domains.html',import.meta.url),'utf8');
test('DNS value direct route, fresh reload, native history and invalid values clear partial results',async()=>{
 const lab=await startInventoryUiLab();const nav=navigation('#value_search=192.0.2.25&dns_page=2&search=sample-&page=2&page_size=10');let ui,document,window;
 const mount=()=>{({document,window}=parseHTML(html));ui=mountDomainNavigation(document,{navigation:nav,fetcher:(url,options)=>fetch(new URL(url,lab.origin),options)});};
 try{mount();await ui.ready;const panel=()=>document.querySelector('[aria-label="DNS value search"]');assert.equal(panel().hidden,false);assert.match(panel().textContent,/18 matching DNS records.*Page 2 of 2/);assert.equal(panel().querySelectorAll('td').length,48);
 ui.destroy();mount();await ui.ready;assert.match(panel().textContent,/Page 2 of 2/);
 const input=panel().querySelector('input');input.value='198.51.100.25';panel().querySelector('form').dispatchEvent(new window.Event('submit',{cancelable:true}));await ui.settled();assert.match(nav.location.hash,/value_search=198.51.100.25/);assert.match(panel().textContent,/6 matching DNS records/);
 nav.history.back();await ui.settled();assert.match(panel().textContent,/18 matching DNS records.*Page 2 of 2/);nav.history.forward();await ui.settled();assert.match(panel().textContent,/6 matching DNS records/);
 nav.history.pushState(null,'','#value_search=%00');nav.events.dispatchEvent(new Event('hashchange'));await ui.settled();assert.match(panel().textContent,/Enter a DNS value/);assert.equal(panel().querySelectorAll('td').length,0);
 nav.history.pushState(null,'','#value_search=a&value_search=b');nav.events.dispatchEvent(new Event('popstate'));await ui.settled();assert.match(panel().textContent,/Enter a DNS value/);assert.equal(panel().querySelectorAll('td').length,0);
 console.log('DNS_VALUE_NAV_V10_PROOF',JSON.stringify({actualHttpPostgres:true,directPage2:true,reloadFreshDom:true,backForward:true,invalidControlDuplicateNoPartial:true}));
 }finally{ui?.destroy();await lab.close();}
});
