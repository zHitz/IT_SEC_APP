const columns = {
 domains: [['fqdn','Domain'],['source','Source'],['first_seen_at','First seen'],['last_seen_at','Last seen'],['confidence','Confidence'],['tags','Tags']],
 'dns-records': [['domain','Domain'],['type','Type'],['value','Value'],['source','Source'],['first_seen_at','First seen'],['last_seen_at','Last seen'],['confidence','Confidence'],['tags','Tags']]
};
export function validateInventory(data, resource) {
 const meta=data?.meta;
 if(!Array.isArray(data?.data)||!meta||![meta.page,meta.page_size,meta.total,meta.total_pages].every(Number.isSafeInteger)||meta.page<1||meta.page_size<1||meta.page_size>100||meta.total<0||meta.total_pages!==Math.ceil(meta.total/meta.page_size)||data.data.length>meta.page_size)throw Error('INVALID_RESPONSE');
 for(const row of data.data){
  if(!row||typeof row.id!=='string')throw Error('INVALID_RESPONSE');
  for(const [key]of columns[resource]){
   if(key==='tags'){if(!Array.isArray(row.tags)||row.tags.some(tag=>typeof tag!=='string'))throw Error('INVALID_RESPONSE');}
   else if(row[key]!==null&&typeof row[key]!=='string')throw Error('INVALID_RESPONSE');
  }
 }
 return data;
}
export function mountDomainInventory(document,{fetcher=fetch}={}) {
 const get=id=>document.getElementById(id);
 const state={resource:'domains',search:'',flag:'',page:1,pageSize:25,totalPages:0,busy:false};
 let generation=0,active;
 function render(data){
  const head=document.createElement('tr');
  for(const [,label]of columns[state.resource]){const th=document.createElement('th');th.scope='col';th.textContent=label;head.append(th);}
  get('inventory-head').replaceChildren(head);get('inventory-rows').replaceChildren();
  get('inventory-caption').textContent=(state.resource==='domains'?'Domains':'DNS records')+' with source, observation times, confidence and tags';
  for(const row of data.data){
   const tr=document.createElement('tr');
   for(const [key]of columns[state.resource]){
    const td=document.createElement('td');
    if(key==='tags'){
     if(!row.tags.length)td.textContent='—';
     for(const tag of row.tags){const span=document.createElement('span');span.className=tag==='cloudflare:outside-known-range'?'tag tag-flag':'tag';span.textContent=tag;td.append(span);}
    }else{
     td.textContent=row[key]??'—';
     if(key.endsWith('_at')&&row[key]){const date=new Date(row[key]);if(!Number.isNaN(+date)){td.textContent=date.toISOString().replace('T',' ').replace('.000Z',' UTC');td.title=row[key];}}
     if(['domain','fqdn','value'].includes(key))td.className='mono';
    }
    tr.append(td);
   }
   get('inventory-rows').append(tr);
  }
  state.totalPages=data.meta.total_pages;
  get('inventory-total').textContent=`${data.meta.total} ${state.resource==='domains'?'domains':'DNS records'} matching`;
  get('inventory-page').textContent=data.meta.total_pages?`Page ${state.page} of ${data.meta.total_pages}`:'No pages';
  get('inventory-status').textContent=data.data.length?'':data.meta.total?'No results on this page. Use Previous or clear filters.':'No matching records. Try another search or clear filters.';
 }
 function controls(){
  get('inventory-prev').disabled=state.busy||state.page<=1;
  get('inventory-next').disabled=state.busy||state.page>=state.totalPages;
  get('inventory-results').setAttribute('aria-busy',String(state.busy));
  get('domains-tab').setAttribute('aria-pressed',String(state.resource==='domains'));
  get('records-tab').setAttribute('aria-pressed',String(state.resource==='dns-records'));
 }
 async function load(){
  active?.abort();active=new AbortController();const controller=active,signal=controller.signal,version=++generation;
  state.busy=true;controls();get('inventory-retry').hidden=true;get('inventory-status').textContent='Loading inventory…';
  get('inventory-rows').replaceChildren();get('inventory-total').textContent='Loading inventory…';
  const query=new URLSearchParams({page:String(state.page),page_size:String(state.pageSize)});
  if(state.search)query.set('search',state.search);if(state.flag)query.set('outside_known_range',state.flag);
  const timeout=setTimeout(()=>controller.abort(),8000);
  try{
   const response=await fetcher(`/api/v1/inventory/${state.resource}?${query}`,{signal,headers:{Accept:'application/json'}});
   if(!response.ok)throw Error('UNAVAILABLE');
   const data=validateInventory(await response.json(),state.resource);
   if(version!==generation)return;if(data.meta.page!==state.page||data.meta.page_size!==state.pageSize)throw Error('INVALID_RESPONSE');render(data);
  }catch{
   if(version!==generation)return;
   state.totalPages=0;get('inventory-page').textContent='Page unavailable';get('inventory-total').textContent='Inventory unavailable';
   get('inventory-status').textContent='Could not load inventory. Check that the local inventory API is enabled, then try again.';get('inventory-retry').hidden=false;
  }finally{clearTimeout(timeout);if(version===generation){state.busy=false;controls();}}
 }
 get('inventory-search').addEventListener('submit',event=>{event.preventDefault();state.search=get('domain-search').value.trim();state.flag=get('range-filter').value;state.page=1;void load();});
 get('range-filter').addEventListener('change',()=>{state.flag=get('range-filter').value;state.search=get('domain-search').value.trim();state.page=1;void load();});
 get('clear-filters').addEventListener('click',()=>{get('domain-search').value='';get('range-filter').querySelector('option[value=""]').selected=true;state.search='';state.flag='';state.page=1;void load();});
 get('page-size').addEventListener('change',()=>{state.pageSize=Number(get('page-size').value);state.page=1;void load();});
 for(const [id,resource]of [['domains-tab','domains'],['records-tab','dns-records']])get(id).addEventListener('click',()=>{state.resource=resource;state.page=1;void load();});
 get('inventory-prev').addEventListener('click',()=>{if(!get('inventory-prev').disabled){state.page--;void load();}});
 get('inventory-next').addEventListener('click',()=>{if(!get('inventory-next').disabled){state.page++;void load();}});
 get('inventory-retry').addEventListener('click',()=>void load());
 return {ready:load(),state,reload:load,destroy(){generation++;active?.abort();}};
}
