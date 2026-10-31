const labels={domains:'domains','dns-records':'DNS records',hosts:'hosts',packages:'packages','listening-ports':'listening ports'};
const columns = {
 hosts:[['hostname','Hostname'],['os','OS'],['os_version','OS version'],['first_seen_at','First seen'],['last_seen_at','Last seen']],
 packages:[['name','Package'],['version','Version'],['ecosystem','Ecosystem'],['host_id','Host ID']],
 'listening-ports':[['host_id','Host ID'],['protocol','Protocol'],['port','Port'],['bind_address','Bind address'],['process','Process'],['pid','PID']],
 domains: [['fqdn','Domain'],['source','Source'],['first_seen_at','First seen'],['last_seen_at','Last seen'],['confidence','Confidence'],['tags','Tags']],
 'dns-records': [['domain','Domain'],['type','Type'],['value','Value'],['source','Source'],['first_seen_at','First seen'],['last_seen_at','Last seen'],['confidence','Confidence'],['tags','Tags']]
};
export function validateInventory(data, resource) {
 const meta=data?.meta;
 if(!Array.isArray(data?.data)||!meta||![meta.page,meta.page_size,meta.total,meta.total_pages].every(Number.isSafeInteger)||meta.page<1||meta.page_size<1||meta.page_size>200||meta.total<0||meta.total_pages!==Math.ceil(meta.total/meta.page_size)||data.data.length>meta.page_size)throw Error('INVALID_RESPONSE');
 for(const row of data.data){
  if(!row||typeof row.id!=='string')throw Error('INVALID_RESPONSE');
  for(const [key]of columns[resource]){
   if(key==='tags'){if(!Array.isArray(row.tags)||row.tags.some(tag=>typeof tag!=='string'))throw Error('INVALID_RESPONSE');}
   else if(row[key]!==null&&( ['pid','port'].includes(key) ? !Number.isSafeInteger(row[key]) : typeof row[key]!=='string'))throw Error('INVALID_RESPONSE');
  }
 }
 return data;
}
export function mountInventoryTable(document,{fetcher=fetch,mode='domain',onSelect,onStateChange,initialState={},useStandardApi=false}={}) {
 const get=id=>document.getElementById(id);
 const resourceButtons=mode==='host'?[['domains-tab','hosts'],['records-tab','packages'],['ports-tab','listening-ports']]:[['domains-tab','domains'],['records-tab','dns-records']];
 const state={resource:mode==='host'?'hosts':'domains',search:'',flag:'',page:1,pageSize:25,totalPages:0,busy:false,...initialState};
 let generation=0,active;let siteInput,sortInput,directionInput;if(mode==='host'){const label=document.createElement('label');label.textContent='Site ID filter';siteInput=document.createElement('input');siteInput.setAttribute('aria-label','Site ID filter');siteInput.placeholder='All Sites or Site UUID';siteInput.value=state.siteId??'';label.append(siteInput);get('inventory-search').append(label);for(const [name,values,key]of [['Sort Hosts',['hostname','os','os_version'],'sort'],['Sort direction',['asc','desc'],'direction']]){const l=document.createElement('label');l.textContent=name;const select=document.createElement('select');select.setAttribute('aria-label',name);for(const value of values){const o=document.createElement('option');o.value=value;o.textContent=value;select.append(o);}[...select.querySelectorAll('option')].find(o=>o.value===(values.includes(state[key])?state[key]:values[0])).selected=true;l.append(select);get('inventory-search').append(l);if(key==='sort')sortInput=select;else directionInput=select;select.addEventListener('change',()=>{state.page=1;void userLoad();});}}
  function clearProtected(){
   generation++;active?.abort();state.busy=false;state.totalPages=0;get('inventory-rows')?.replaceChildren();
   const p=get('inventory-page');if(p)p.textContent='Page unavailable';
   const t=get('inventory-total');if(t)t.textContent='Authentication required';
   const s=get('inventory-status');if(s)s.textContent='Session expired or not authenticated. Please log in to view host inventory.';
   const r=get('inventory-retry');if(r)r.hidden=true;controls();
  }
  const onSessionChange=e=>{const sess=e?.detail||e?.session;if(sess&&!sess.authenticated)clearProtected();};
  document.addEventListener?.('atlas:session-change',onSessionChange);
 if(mode==='domain'){for(const [name,values,key]of [['Sort Domains',['hostname'],'sort'],['Sort direction',['asc','desc'],'direction']]){const l=document.createElement('label');l.textContent=name;const select=document.createElement('select');select.setAttribute('aria-label',name);for(const value of values){const o=document.createElement('option');o.value=value;o.textContent=value;select.append(o);}const options=[...select.querySelectorAll('option')];(options.find(o=>o.value===state[key])??options[0]).selected=true;l.append(select);get('inventory-search').append(l);if(key==='sort')sortInput=select;else directionInput=select;select.addEventListener('change',()=>{state.page=1;void userLoad();});}}
 function render(data){
  const head=document.createElement('tr');
  for(const [,label]of columns[state.resource]){const th=document.createElement('th');th.scope='col';th.textContent=label;head.append(th);}
  get('inventory-head').replaceChildren(head);get('inventory-rows').replaceChildren();
  get('inventory-caption').textContent=labels[state.resource]+' inventory';
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
    if(onSelect && ((state.resource==='hosts'&&key==='hostname')||(state.resource==='domains'&&key==='fqdn')||(state.resource==='dns-records'&&key==='value'))){
     const link=document.createElement('a');link.className='inventory-link';link.href='#detail='+encodeURIComponent(row.id);link.textContent=row[key];link.setAttribute('aria-label','Open '+row[key]);
     link.addEventListener('click',event=>{event.preventDefault();onSelect(row,state.resource);});td.replaceChildren(link);
    }
    tr.append(td);
   }
   get('inventory-rows').append(tr);
  }
  state.totalPages=data.meta.total_pages;
  get('inventory-total').textContent=`${data.meta.total} ${labels[state.resource]} matching`;
  get('inventory-page').textContent=data.meta.total_pages?`Page ${state.page} of ${data.meta.total_pages}`:'No pages';
  get('inventory-status').textContent=data.data.length?'':data.meta.total?'No results on this page. Use Previous or clear filters.':'No matching records. Try another search or clear filters.';
 }
 function controls(){
  get('inventory-prev').disabled=state.busy||state.page<=1;
  get('inventory-next').disabled=state.busy||state.page>=state.totalPages;
  get('inventory-results').setAttribute('aria-busy',String(state.busy));
  for(const [id,resource]of resourceButtons)get(id).setAttribute('aria-pressed',String(state.resource===resource));
  if(mode==='host'){get('domain-search').disabled=state.resource==='listening-ports';get('search-label').textContent=state.resource==='packages'?'Search package name':'Search hostname';get('domain-search').placeholder=state.resource==='packages'?'Search a package…':'Search a host…';}
 }
 async function load(){
  active?.abort();active=new AbortController();const controller=active,signal=controller.signal,version=++generation;
  state.busy=true;controls();get('inventory-retry').hidden=true;get('inventory-status').textContent='Loading inventory…';
  get('inventory-rows').replaceChildren();get('inventory-total').textContent='Loading inventory…';
  let url;
  if(useStandardApi && mode==='host' && state.resource==='hosts'){
    const q=new URLSearchParams({type:'host',page:String(state.page),page_size:String(state.pageSize)});
    if(state.search)q.set('q',state.search);
    if(state.siteId)q.set('site',state.siteId);
    if(state.env)q.set('env',state.env);
    if(state.owner)q.set('owner',state.owner);
    if(state.tag)q.set('tag',state.tag);
    url=`/api/v1/assets?${q}`;
  }else{
    const query=new URLSearchParams({page:String(state.page),page_size:String(state.pageSize)});
    if(['hosts','domains'].includes(state.resource)){if(state.sort)query.set('sort',state.sort);if(state.direction)query.set('direction',state.direction);}if(state.resource==='hosts'&&state.siteId)query.set('site_id',state.siteId);if(state.search&&state.resource!=='listening-ports')query.set('search',state.search);if(state.flag)query.set('outside_known_range',state.flag);
    url=`/api/v1/inventory/${state.resource}?${query}`;
  }
  const timeout=setTimeout(()=>controller.abort(),8000);
  try{
   if(state.invalidCombined)throw Error('INVALID_COMBINED');
   const response=await fetcher(url,{signal,headers:{Accept:'application/json'}});
   if(response.status===401)throw Object.assign(Error('UNAUTHORIZED'),{status:401});
   if(response.status===403)throw Object.assign(Error('FORBIDDEN'),{status:403});
   if(!response.ok)throw Object.assign(Error('UNAVAILABLE'),{status:response.status});
   const data=validateInventory(await response.json(),state.resource);
   if(version!==generation)return;if(data.meta.page!==state.page||data.meta.page_size!==state.pageSize||((state.siteId||state.flag)&&(state.page>Math.max(1,data.meta.total_pages)||(state.siteId&&data.data.some(r=>r.site_id!==state.siteId)))))throw Error('INVALID_RESPONSE');render(data);
  }catch(error){
   if(version!==generation)return;
   state.totalPages=0;get('inventory-page').textContent='Page unavailable';
   get('inventory-rows').replaceChildren();
   if(error.status===401){
     get('inventory-total').textContent='Authentication required';
     get('inventory-status').textContent='Session expired or not authenticated. Please log in to view host inventory.';
     get('inventory-retry').hidden=true;
   }else if(error.status===403){
     get('inventory-total').textContent='Access forbidden';
     get('inventory-status').textContent='Access forbidden. Your account does not have permission to view inventory.';
     get('inventory-retry').hidden=true;
   }else{
     get('inventory-total').textContent='Inventory unavailable';
     get('inventory-status').textContent=error.message==='INVALID_COMBINED'?(mode==='host'?'Invalid combined Host filter. Check Site ID, hostname and page.':'Invalid combined Domain filter. Check search, flag and page.'):'Could not load inventory. Check that the local inventory API is enabled, then try again.';
     get('inventory-retry').hidden=false;
   }
  }finally{clearTimeout(timeout);if(version===generation){state.busy=false;controls();}}
 }
 const userLoad=()=>onStateChange&&['hosts','domains'].includes(state.resource)?onStateChange({...state,siteId:siteInput?.value??'',sort:sortInput?.value??'hostname',direction:directionInput?.value??'asc'}):load();
 get('inventory-search').addEventListener('submit',event=>{event.preventDefault();state.search=get('domain-search').value.trim();state.flag=get('range-filter').value;state.page=1;void userLoad();});
 get('range-filter').addEventListener('change',()=>{state.flag=get('range-filter').value;state.search=get('domain-search').value.trim();state.page=1;void userLoad();});
 get('clear-filters').addEventListener('click',()=>{if(siteInput)siteInput.value='';get('domain-search').value='';get('range-filter').querySelector('option[value=""]').selected=true;state.search='';state.flag='';state.page=1;void userLoad();});
 get('page-size').addEventListener('change',()=>{state.pageSize=Number(get('page-size').value);state.page=1;void userLoad();});
 for(const [id,resource]of resourceButtons)get(id).addEventListener('click',()=>{state.resource=resource;state.page=1;if(mode==='host'){state.search='';get('domain-search').value='';}void userLoad();});
 get('inventory-prev').addEventListener('click',()=>{if(!get('inventory-prev').disabled){state.page--;void userLoad();}});
 get('inventory-next').addEventListener('click',()=>{if(!get('inventory-next').disabled){state.page++;void userLoad();}});
 get('inventory-retry').addEventListener('click',()=>void load());
 return {ready:load(),state,reload:load,setSiteInput(value){if(siteInput)siteInput.value=value;},setSort(sort,direction){for(const [select,value]of [[sortInput,sort],[directionInput,direction]])if(select){for(const o of select.querySelectorAll('option'))o.selected=false;const options=[...select.querySelectorAll('option')];(options.find(o=>o.value===value)??options[0]).selected=true;}},clear:clearProtected,invalidate:clearProtected,destroy(){document.removeEventListener?.('atlas:session-change',onSessionChange);generation++;active?.abort();}};
}
