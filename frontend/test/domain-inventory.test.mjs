import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {mountDomainInventory} from '../src/domain-inventory.mjs';
const html=await readFile(new URL('../src/domains.html',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const row=(resource,name)=>({id:name,[resource==='domains'?'fqdn':'domain']:name,type:'A',value:'192.0.2.5',source:'cloudflare',first_seen_at:'2026-10-24T00:00:00Z',last_seen_at:'2026-10-25T00:00:00Z',confidence:'confirmed',tags:['cloudflare:outside-known-range','user:review']});
function page(resource,n=1,total=26,size=25){return{data:[row(resource,'sample.test')],meta:{page:n,page_size:size,total,total_pages:Math.ceil(total/size)}};}
function setup(fetcher){const {document,window}=parseHTML(html);const ui=mountDomainInventory(document,{fetcher});return{document,window,ui,get:id=>document.getElementById(id),event:(id,type)=>document.getElementById(id).dispatchEvent(new window.Event(type,{bubbles:true,cancelable:true}))};}
test('domain frontend renders provenance, literal search/filter, page requests, resource switch and resets',async()=>{
 const requests=[];const t=setup(async url=>{requests.push(url);const u=new URL(url,'http://localhost');return{ok:true,json:async()=>page(u.pathname.endsWith('domains')?'domains':'dns-records',Number(u.searchParams.get('page')),26,Number(u.searchParams.get('page_size')))}});
 await t.ui.ready;
 assert.match(t.get('inventory-rows').textContent,/sample.test/);assert.match(t.get('inventory-rows').textContent,/cloudflare/);assert.match(t.get('inventory-rows').textContent,/confirmed/);assert.match(t.get('inventory-rows').textContent,/2026-10-25/);assert.equal(t.get('inventory-prev').disabled,true);assert.equal(t.get('inventory-next').disabled,false);assert.match(t.get('inventory-total').textContent,/26 domains/);
 t.event('inventory-next','click');await tick();assert.match(requests.at(-1),/page=2/);assert.match(t.get('inventory-page').textContent,/2 of 2/);
 t.get('domain-search').value=' SAMPLE%_ ';t.event('inventory-search','submit');await tick();const search=new URL(requests.at(-1),'http://localhost').searchParams;assert.equal(search.get('search'),'SAMPLE%_');assert.equal(search.get('page'),'1');
 t.get('range-filter').querySelector('option[value="true"]').selected=true;t.event('range-filter','change');await tick();assert.match(requests.at(-1),/outside_known_range=true/);
 t.event('records-tab','click');await tick();assert.match(requests.at(-1),/dns-records/);assert.match(t.get('inventory-head').textContent,/Value/);assert.match(t.get('inventory-rows').textContent,/192.0.2.5/);assert.equal(t.get('records-tab').getAttribute('aria-pressed'),'true');
 t.event('clear-filters','click');await tick();assert.ok(!requests.at(-1).includes('search='));assert.ok(!requests.at(-1).includes('outside_known_range='));
 t.get('page-size').querySelector('option[value="10"]').selected=true;t.event('page-size','change');await tick();assert.match(requests.at(-1),/page_size=10/);t.ui.destroy();
});
test('domain frontend renders untrusted text safely, empty/error/retry and rejects malformed API responses',async()=>{
 let calls=0;const t=setup(async()=>{calls++;if(calls===1)return{ok:true,json:async()=>({data:[row('domains','<img src=x onerror=alert(1)>')],meta:{page:1,page_size:25,total:1,total_pages:1}})};if(calls===2)return{ok:false};if(calls===3)return{ok:true,json:async()=>({data:[],meta:{page:1,page_size:25,total:0,total_pages:0}})};return{ok:true,json:async()=>({data:[{secret:'not rendered'}],meta:{}})};});
 await t.ui.ready;assert.equal(t.get('inventory-rows').querySelector('img'),null);assert.match(t.get('inventory-rows').textContent,/<img/);await t.ui.reload();assert.equal(t.get('inventory-retry').hidden,false);assert.equal(t.get('inventory-rows').children.length,0);t.event('inventory-retry','click');await tick();assert.match(t.get('inventory-status').textContent,/No matching records/);assert.equal(t.get('inventory-next').disabled,true);await t.ui.reload();assert.equal(t.get('inventory-retry').hidden,false);assert.ok(!t.get('inventory-rows').textContent.includes('secret'));t.ui.destroy();
});
test('domain frontend suppresses stale in-flight results when selection changes',async()=>{
 let resolveFirst;let calls=0;const t=setup(async()=>{if(++calls===1)return new Promise(resolve=>{resolveFirst=resolve;});return{ok:true,json:async()=>page('dns-records',1,1)};});
 t.event('records-tab','click');await tick();resolveFirst({ok:true,json:async()=>page('domains')});await t.ui.ready;assert.match(t.get('inventory-head').textContent,/Value/);assert.equal(t.get('inventory-total').textContent,'1 DNS records matching');t.ui.destroy();
});
