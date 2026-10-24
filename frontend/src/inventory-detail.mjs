import {mountInventoryTable,validateInventory} from './inventory-table.mjs';
const childColumns={'dns-records':[['type','Type'],['value','Value'],['proxied','Proxied'],['ttl','TTL'],['tags','Tags'],['outside_flag','Outside known range']],packages:[['name','Package'],['version','Version'],['ecosystem','Ecosystem']],'listening-ports':[['protocol','Protocol'],['port','Port'],['bind_address','Bind address'],['process','Process'],['pid','PID']]};
export function mountInventoryDetail(document,{mode='host',fetcher=fetch}={}){
 const get=id=>document.getElementById(id),history=document.defaultView?.history;
 let selected,version=0,active;const pages={packages:1,'listening-ports':1,'dns-records':1};let lastFocus;
 const textNode=(tag,text)=>{const el=document.createElement(tag);el.textContent=text??'—';return el;};
 function info(row){get('detail-info').replaceChildren();for(const [key,label]of(mode==='domain'?[['fqdn','Domain'],['id','Domain ID'],['source','Source'],['first_seen_at','First seen'],['last_seen_at','Last seen'],['confidence','Confidence'],['tags','Tags']]:[['hostname','Hostname'],['os','OS'],['os_version','OS version'],['id','Host ID']])){get('detail-info').append(textNode('dt',label),textNode('dd',Array.isArray(row[key])?row[key].join(', '):row[key]));}}
 async function read(resource,page,signal){
  if(mode==='domain'){
   const fqdn=selected.fqdn,exact=[];let totalPages=1;
   // Existing v4 search is substring-only; exhaust bounded candidates, then enforce exact domain equality.
   for(let candidate=1;candidate<=totalPages;candidate++){
    const query=new URLSearchParams({search:fqdn.slice(0,200),page:String(candidate),page_size:'100'});
    const response=await fetcher(`/api/v1/inventory/dns-records?${query}`,{signal,headers:{Accept:'application/json'}});
    if(!response.ok)throw Error('DETAIL_UNAVAILABLE');const payload=validateInventory(await response.json(),'dns-records');
    if(payload.meta.page!==candidate||payload.meta.page_size!==100||payload.meta.total_pages>100)throw Error('DETAIL_CANDIDATE_LIMIT');
    totalPages=payload.meta.total_pages;
    for(const row of payload.data)if(row.domain===fqdn){
     if(!(row.proxied===null||typeof row.proxied==='boolean')||!(row.ttl===null||Number.isSafeInteger(row.ttl)))throw Error('INVALID_DNS_DETAIL');
     exact.push({...row,outside_flag:row.tags.includes('cloudflare:outside-known-range')?'Flagged':'Not flagged'});
    }
   }
   const unique=[...new Map(exact.map(row=>[row.id,row])).values()];
   return{data:unique.slice((page-1)*25,page*25),meta:{page,page_size:25,total:unique.length,total_pages:Math.ceil(unique.length/25)}};
  }
  const query=new URLSearchParams({host_id:selected.id,page:String(page),page_size:'25'});
  const response=await fetcher(`/api/v1/inventory/${resource}?${query}`,{signal,headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('DETAIL_UNAVAILABLE');const payload=validateInventory(await response.json(),resource);
  if(payload.meta.page!==page||payload.meta.page_size!==25||payload.data.some(row=>row.host_id!==selected.id))throw Error('DETAIL_SCOPE_MISMATCH');return payload;
 }
 function renderChildren(resource,payload){
  const section=document.createElement('section');section.className='detail-section';section.append(textNode('h3',resource==='dns-records'?'DNS records':resource==='packages'?'Packages':'Listening ports'),textNode('p',`${payload.meta.total} matching records`));
  const scroll=document.createElement('div');scroll.className='table-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',resource+' for selected '+mode);
  const table=document.createElement('table'),caption=textNode('caption',resource+' for selected '+mode);caption.className='sr-only';table.append(caption);
  const head=document.createElement('thead'),tr=document.createElement('tr');for(const [,label]of childColumns[resource]){const th=textNode('th',label);th.scope='col';tr.append(th);}head.append(tr);table.append(head);
  const body=document.createElement('tbody');for(const row of payload.data){const tr=document.createElement('tr');for(const[key]of childColumns[resource])tr.append(textNode('td',Array.isArray(row[key])?row[key].join(', '):typeof row[key]==='boolean'?String(row[key]):row[key]));body.append(tr);}table.append(body);scroll.append(table);section.append(scroll);
  if(!payload.data.length)section.append(textNode('p','No records on this page for the selected '+mode+'.'));
  const pager=document.createElement('div');pager.className='inventory-pagination';pager.append(textNode('span',payload.meta.total_pages?`Page ${payload.meta.page} of ${payload.meta.total_pages}`:'No pages'));
  for(const [label,step]of [['Previous',-1],['Next',1]]){const button=textNode('button',label);button.type='button';button.setAttribute('aria-label',label+' '+resource);button.disabled=step<0?pages[resource]<=1:pages[resource]>=payload.meta.total_pages;button.addEventListener('click',()=>{pages[resource]+=step;void load();});pager.append(button);}section.append(pager);return section;
 }
 async function load(){
  active?.abort();const controller=new AbortController();active=controller;const current=++version,timeout=setTimeout(()=>controller.abort(),8000);
  get('detail-related').replaceChildren();get('detail-status').textContent='Loading details…';get('detail-retry').hidden=true;get('inventory-detail').setAttribute('aria-busy','true');
  try{const resources=mode==='domain'?['dns-records']:['packages','listening-ports'];const payloads=await Promise.all(resources.map(resource=>read(resource,pages[resource],controller.signal)));if(current!==version)return;
   get('detail-related').replaceChildren(...resources.map((resource,i)=>renderChildren(resource,payloads[i])));get('detail-status').textContent='';
  }catch(error){if(current!==version)return;get('detail-status').textContent=error.message==='DETAIL_CANDIDATE_LIMIT'?'This domain has too many candidate records to display safely. Return to the list; no partial result was shown.':'Could not load the selected '+mode+' details. Retry or return to the list.';get('detail-retry').hidden=false;}
  finally{clearTimeout(timeout);if(current===version)get('inventory-detail').setAttribute('aria-busy','false');}
 }
 function showList(){version++;active?.abort();get('inventory-list').hidden=false;get('inventory-detail').hidden=true;try{lastFocus?.focus();}catch{} }
 async function open(row,{recordHistory=true}={}){
  validateInventory({data:[row],meta:{page:1,page_size:25,total:1,total_pages:1}},mode==='domain'?'domains':'hosts');selected=row;lastFocus=document.activeElement;pages.packages=1;pages['listening-ports']=1;pages['dns-records']=1;
  get('inventory-list').hidden=true;get('inventory-detail').hidden=false;get('detail-title').textContent=mode==='domain'?row.fqdn:row.hostname;info(row);get('detail-title').focus?.();
  if(recordHistory)history?.pushState({atlasSelection:{mode,row}},'', '#detail='+encodeURIComponent(row.id));await load();
 }
 const list=mountInventoryTable(document,{mode,fetcher,onSelect:row=>void open(row)});
 get('detail-back').addEventListener('click',()=>{showList();history?.replaceState(null,'',document.defaultView.location.pathname);});get('detail-retry').addEventListener('click',()=>void load());
 document.defaultView?.addEventListener('popstate',event=>{if(event.state?.atlasSelection?.mode===mode)void open(event.state.atlasSelection.row,{recordHistory:false});else showList();});
 return{ready:list.ready,list,open,back:showList,destroy(){version++;active?.abort();list.destroy();}};
}
