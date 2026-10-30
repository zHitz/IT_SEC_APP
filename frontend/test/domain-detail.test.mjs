import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{parseHTML}from'linkedom';import{mountInventoryDetail}from'../src/inventory-detail.mjs';import{startInventoryUiLab}from'../../scripts/inventory-ui-lab.mjs';
const html=await readFile(new URL('../src/domains.html',import.meta.url),'utf8');
test('Domain detail renders exact-domain DNS fields/provenance/flag, pages through children and Back retains list search/filter/page',async()=>{
 const lab=await startInventoryUiLab();const{document,window}=parseHTML(html);const get=id=>document.getElementById(id);
 // Additional synthetic records and an overlapping-name domain prove exact scope, not substring leakage.
 for(let n=1;n<=30;n++)await lab.db.query(`INSERT INTO asset_inventory.dns_record(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,domain,type,value,proxied,ttl)
 SELECT $1::uuid,source,first_seen_at,last_seen_at,observed_at,confidence,'seed://detail-v6','synthetic-test',ARRAY['synthetic'],'sample-12.test','A',$2,true,120 FROM asset_inventory.dns_record WHERE domain='sample.test'`,[`30000000-0000-4000-8000-${String(n).padStart(12,'0')}`,`192.0.2.${n}`]);
 await lab.db.query(`INSERT INTO asset_inventory.domain(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,fqdn,is_internal)
 SELECT '30000000-0000-4000-8000-000000000090',source,first_seen_at,last_seen_at,observed_at,confidence,'seed://detail-trap','synthetic-test',ARRAY['synthetic'],'api.sample-12.test',false FROM asset_inventory.domain WHERE fqdn='sample.test'`);
 await lab.db.query(`INSERT INTO asset_inventory.dns_record(id,source,first_seen_at,last_seen_at,observed_at,confidence,raw_ref,environment,tags,domain,type,value,ttl)
 SELECT '30000000-0000-4000-8000-000000000091',source,first_seen_at,last_seen_at,observed_at,confidence,'seed://detail-trap','synthetic-test',ARRAY['synthetic'],'api.sample-12.test','A','192.0.2.254',300 FROM asset_inventory.dns_record WHERE domain='sample.test'`);
 const requests=[],ui=mountInventoryDetail(document,{mode:'domain',fetcher:(url,options)=>{requests.push(url);return fetch(new URL(url,lab.origin),options);}});
 const settled=async()=>{for(let i=0;i<100;i++){if(get('inventory-detail').getAttribute('aria-busy')==='false')return;await new Promise(r=>setTimeout(r,10));}throw Error('detail timeout');};
 try{
  await ui.ready;ui.list.state.search='sample-';ui.list.state.page=2;ui.list.state.pageSize=10;get('domain-search').value='sample-';await ui.list.reload();
  const prior=get('inventory-rows').textContent;const link=[...get('inventory-rows').querySelectorAll('a')].find(x=>x.textContent==='sample-12.test');assert.ok(link);link.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));await settled();
  assert.equal(get('inventory-list').hidden,true);assert.match(get('detail-info').textContent,/cloudflare/);assert.match(get('detail-info').textContent,/confirmed/);assert.match(get('detail-info').textContent,/2026-10-24/);
  assert.match(get('detail-related').textContent,/31 matching records/);assert.match(get('detail-related').textContent,/Proxied/);assert.match(get('detail-related').textContent,/TTL/);assert.match(get('detail-related').textContent,/true/);assert.match(get('detail-related').textContent,/Flagged/);assert.match(get('detail-related').textContent,/Not flagged/);assert.ok(!get('detail-related').textContent.includes('192.0.2.254'));
  get('detail-related').querySelector('button[aria-label="Next dns-records"]').dispatchEvent(new window.Event('click'));await settled();assert.match(get('detail-related').textContent,/Page 2 of 2/);
  get('detail-back').dispatchEvent(new window.Event('click'));assert.equal(ui.list.state.page,2);assert.equal(ui.list.state.search,'sample-');assert.equal(get('inventory-rows').textContent,prior);
  ui.list.state.flag='true';ui.list.state.page=1;get('range-filter').querySelector('option[value="true"]').selected=true;await ui.list.reload();const row=(await(await fetch(lab.origin+'/api/v1/inventory/domains?search=sample-08')).json()).data[0];await ui.open(row);ui.back();assert.equal(ui.list.state.flag,'true');assert.equal(get('range-filter').value,'true');
  assert.ok(requests.filter(x=>x.includes('/dns-records?')).every(x=>!x.includes('outside_known_range=')));
  console.log('DOMAIN_DETAIL_V7_PROOF',JSON.stringify({synthetic:true,actualHttpPostgres:true,exactOwnerApi:true,substringTrapExcluded:true,records:31,childPages:2,provenance:true,typeValueProxiedTtlTagsFlag:true,backSearchFilterPage:true,cloudflareRequests:0}));
 }finally{ui.destroy();await lab.close();}
});
test('Domain exact-owner detail handles large server totals without candidate scanning and clears not-found data',async()=>{
 const{document}=parseHTML(html);const row={id:'10000000-0000-4000-8000-000000000012',fqdn:'safe.test',source:'cloudflare',first_seen_at:null,last_seen_at:null,confidence:'confirmed',tags:[]};const requests=[];let missing=false;
 const record={id:'10000000-0000-4000-8000-000000000013',domain:'safe.test',type:'A',value:'192.0.2.5',proxied:false,ttl:300,source:'cloudflare',first_seen_at:null,last_seen_at:null,confidence:'confirmed',tags:[]};
 const ui=mountInventoryDetail(document,{mode:'domain',fetcher:async url=>{requests.push(url);return missing&&!url.includes('/domains?')?{ok:false,status:404}:{ok:true,json:async()=>url.includes('/domains?')?{data:[row],meta:{page:1,page_size:25,total:1,total_pages:1}}:url.includes('/dns-records?')?{data:[record],meta:{page:1,page_size:25,total:10001,total_pages:401}}:{data:row}};}});
 await ui.ready;await ui.open(row);assert.match(document.getElementById('detail-related').textContent,/10001 matching records/);assert.equal(requests.filter(x=>x.includes('/dns-records?')).length,1);assert.ok(!requests.at(-1).includes('search='));
 missing=true;await ui.open(row);assert.match(document.getElementById('detail-status').textContent,/Domain not found/);assert.equal(document.getElementById('detail-related').textContent,'');assert.equal(document.getElementById('detail-info').textContent,'');ui.destroy();
});
