import {mountInventoryTable,validateInventory} from './inventory-table.mjs';
const childColumns={packages:[['name','Package'],['version','Version'],['ecosystem','Ecosystem']],'listening-ports':[['protocol','Protocol'],['port','Port'],['bind_address','Bind address'],['process','Process'],['pid','PID']]};
export function mountInventoryDetail(document,{mode='host',fetcher=fetch}={}){
 const get=id=>document.getElementById(id),history=document.defaultView?.history;
 let selected,version=0,active;const pages={packages:1,'listening-ports':1};let lastFocus;
 const textNode=(tag,text)=>{const el=document.createElement(tag);el.textContent=text??'—';return el;};
 function info(row){get('detail-info').replaceChildren();for(const [key,label]of [['hostname','Hostname'],['os','OS'],['os_version','OS version'],['id','Host ID']]){get('detail-info').append(textNode('dt',label),textNode('dd',row[key]));}}
 async function read(resource,page,signal){
  const query=new URLSearchParams({host_id:selected.id,page:String(page),page_size:'25'});
  const response=await fetcher(`/api/v1/inventory/${resource}?${query}`,{signal,headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('DETAIL_UNAVAILABLE');const payload=validateInventory(await response.json(),resource);
  if(payload.meta.page!==page||payload.meta.page_size!==25||payload.data.some(row=>row.host_id!==selected.id))throw Error('DETAIL_SCOPE_MISMATCH');return payload;
 }
 function renderChildren(resource,payload){
  const section=document.createElement('section');section.className='detail-section';section.append(textNode('h3',resource==='packages'?'Packages':'Listening ports'),textNode('p',`${payload.meta.total} matching records`));
  const scroll=document.createElement('div');scroll.className='table-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',resource+' for selected host');
  const table=document.createElement('table'),caption=textNode('caption',resource+' for selected host');caption.className='sr-only';table.append(caption);
  const head=document.createElement('thead'),tr=document.createElement('tr');for(const [,label]of childColumns[resource]){const th=textNode('th',label);th.scope='col';tr.append(th);}head.append(tr);table.append(head);
  const body=document.createElement('tbody');for(const row of payload.data){const tr=document.createElement('tr');for(const[key]of childColumns[resource])tr.append(textNode('td',row[key]));body.append(tr);}table.append(body);scroll.append(table);section.append(scroll);
  if(!payload.data.length)section.append(textNode('p','No records on this page for the selected host.'));
  const pager=document.createElement('div');pager.className='inventory-pagination';pager.append(textNode('span',payload.meta.total_pages?`Page ${payload.meta.page} of ${payload.meta.total_pages}`:'No pages'));
  for(const [label,step]of [['Previous',-1],['Next',1]]){const button=textNode('button',label);button.type='button';button.setAttribute('aria-label',label+' '+resource);button.disabled=step<0?pages[resource]<=1:pages[resource]>=payload.meta.total_pages;button.addEventListener('click',()=>{pages[resource]+=step;void load();});pager.append(button);}section.append(pager);return section;
 }
 async function load(){
  active?.abort();const controller=new AbortController();active=controller;const current=++version,timeout=setTimeout(()=>controller.abort(),8000);
  get('detail-related').replaceChildren();get('detail-status').textContent='Loading details…';get('detail-retry').hidden=true;get('inventory-detail').setAttribute('aria-busy','true');
  try{const resources=['packages','listening-ports'];const payloads=await Promise.all(resources.map(resource=>read(resource,pages[resource],controller.signal)));if(current!==version)return;
   get('detail-related').replaceChildren(...resources.map((resource,i)=>renderChildren(resource,payloads[i])));get('detail-status').textContent='';
  }catch{if(current!==version)return;get('detail-status').textContent='Could not load the selected host details. Retry or return to the list.';get('detail-retry').hidden=false;}
  finally{clearTimeout(timeout);if(current===version)get('inventory-detail').setAttribute('aria-busy','false');}
 }
 function showList(){version++;active?.abort();get('inventory-list').hidden=false;get('inventory-detail').hidden=true;try{lastFocus?.focus();}catch{} }
 async function open(row,{recordHistory=true}={}){
  validateInventory({data:[row],meta:{page:1,page_size:25,total:1,total_pages:1}},'hosts');selected=row;lastFocus=document.activeElement;pages.packages=1;pages['listening-ports']=1;
  get('inventory-list').hidden=true;get('inventory-detail').hidden=false;get('detail-title').textContent=row.hostname;info(row);get('detail-title').focus?.();
  if(recordHistory)history?.pushState({atlasSelection:{mode,row}},'', '#detail='+encodeURIComponent(row.id));await load();
 }
 const list=mountInventoryTable(document,{mode,fetcher,onSelect:row=>void open(row)});
 get('detail-back').addEventListener('click',()=>{showList();history?.replaceState(null,'',document.defaultView.location.pathname);});get('detail-retry').addEventListener('click',()=>void load());
 document.defaultView?.addEventListener('popstate',event=>{if(event.state?.atlasSelection?.mode===mode)void open(event.state.atlasSelection.row,{recordHistory:false});else showList();});
 return{ready:list.ready,list,open,back:showList,destroy(){version++;active?.abort();list.destroy();}};
}
