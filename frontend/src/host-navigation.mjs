import {mountSiteHosts} from './site-hosts.mjs';
import {mountPortSearch} from './port-search.mjs';
import {mountPackageHosts} from './package-hosts.mjs';
import {mountInventoryDetail} from './inventory-detail.mjs';
export function parseHostRoute(location){
 const params=new URLSearchParams((location?.hash??'').replace(/^#/,''));
 const integer=(key,fallback,max)=>/^[1-9]\d*$/.test(params.get(key)??'')&&Number(params.get(key))<=max?Number(params.get(key)):fallback;
 const raw=params.get('search')??'';const search=raw.length<=200&&!/[\u0000-\u001f\u007f]/.test(raw)?raw.trim():'';
 const size=integer('page_size',25,100),pageSize=[10,25,50,100].includes(size)?size:25;
 const id=params.has('host')?(params.get('host')??''):params.has('detail')?(params.get('detail')??''):null;
 const unassigned=['unassigned','unassigned_search','unassigned_page'].some(k=>params.has(k)),unassignedSearch=params.get('unassigned_search')??'',unassignedPage=params.has('unassigned_page')?integer('unassigned_page',0,100000):1;
 const unassignedInvalid=unassigned&&(params.getAll('unassigned').length!==1||params.get('unassigned')!=='1'||params.getAll('unassigned_search').length>1||params.getAll('unassigned_page').length>1||!unassignedPage||unassignedSearch.length>200||/[\u0000-\u001f\u007f]/.test(unassignedSearch));
 const sitePicker=['site_picker','selected_site','picker_page','site_search','site_host_page'].some(k=>params.has(k)),selectedSite=params.get('selected_site')??'',pickerPage=params.has('picker_page')?integer('picker_page',0,100000):1,siteHostPage=params.has('site_host_page')?integer('site_host_page',0,100000):1,siteSearch=params.get('site_search')??'';
 const siteInvalid=sitePicker&&(unassigned||params.get('site_picker')!=='1'||['site_picker','selected_site','picker_page','site_search','site_host_page'].some(k=>params.getAll(k).length>1)||!pickerPage||!siteHostPage||siteSearch.length>200||/[\u0000-\u001f\u007f]/.test(siteSearch)||(selectedSite&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedSite)));
 const packageId=params.get('package')??null,packageSearch=params.get('package_search')??'',packagePage=params.has('package_page')?integer('package_page',0,100000):1,packageRoute=['package','package_search','package_page'].some(k=>params.has(k)),packageInvalid=packageRoute&&(!packageId||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(packageId)||['package','package_search','package_page'].some(k=>params.getAll(k).length>1)||!packagePage||packageSearch.length>200||/[\u0000-\u001f\u007f]/.test(packageSearch)||unassigned||sitePicker);
 const portRoute=['port_search','port','process_search','port_page'].some(k=>params.has(k)),port=params.get('port')??'',process=params.get('process_search')??'',portPage=params.has('port_page')?integer('port_page',0,100000):1,portInvalid=portRoute&&(params.get('port_search')!=='1'||['port_search','port','process_search','port_page'].some(k=>params.getAll(k).length>1)||!portPage||(!port&&!process)||(port&&(!/^[1-9]\d{0,4}$/.test(port)||Number(port)>65535))||process.length>200||/[\u0000-\u001f\u007f]/.test(process)||unassigned||sitePicker||packageRoute);
 const siteId=params.get('site_id')??'',invalidCombined=params.has('site_id')&&(params.getAll('site_id').length!==1||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siteId)||['search','page','page_size'].some(k=>params.getAll(k).length>1)||(params.has('page')&&!/^[1-9]\d*$/.test(params.get('page')))||Number(params.get('page')??1)>100000||(params.has('page_size')&&!['10','25','50','100'].includes(params.get('page_size')))||raw.length>200||/[\u0000-\u001f\u007f]/.test(raw));
 const packageDetailPage=params.has('package_detail_page')?integer('package_detail_page',0,100000):1,portDetailPage=params.has('port_detail_page')?integer('port_detail_page',0,100000):1,hasHostPages=params.has('package_detail_page')||params.has('port_detail_page'),invalidHostPages=hasHostPages&&(!id||!packageDetailPage||!portDetailPage||['package_detail_page','port_detail_page'].some(k=>params.getAll(k).length>1)||portRoute||packageRoute||sitePicker||unassigned);
 return{packageDetailPage,portDetailPage,invalidHostPages,portRoute,port,process,portPage,portInvalid,packageId,packageSearch,packagePage,packageRoute,packageInvalid,sitePicker,selectedSite,pickerPage,siteHostPage,siteSearch,siteInvalid,unassigned,unassignedSearch,unassignedPage,unassignedInvalid,id:id===null?null:id.toLowerCase(),context:{resource:'hosts',siteId,invalidCombined,search,page:integer('page',1,100000),pageSize}};
}
export function mountHostNavigation(document,{fetcher=fetch,navigation}={}){
 const view=document.defaultView;
 const nav=navigation??{history:view.history,location:view.location,events:view};
 const route=parseHostRoute(nav.location);let siteView,portView,packageView,core,lastRoute=null,routePending=Promise.resolve();
 const get=id=>document.getElementById(id);
 const context=()=>({resource:'hosts',siteId:core.list.state.siteId??'',invalidCombined:false,search:core.list.state.search,page:core.list.state.page,pageSize:core.list.state.pageSize});
 function fragment(id,ctx){const p=new URLSearchParams(id===null?{list:'1'}:{host:id});if(ctx.siteId)p.set('site_id',ctx.siteId);if(ctx.search)p.set('search',ctx.search);p.set('page',String(ctx.page));p.set('page_size',String(ctx.pageSize));return'#'+p;}
 function applyContext(ctx,force=false){
  const changed=['resource','siteId','invalidCombined','search','page','pageSize'].some(k=>core.list.state[k]!==ctx[k]);
  Object.assign(core.list.state,ctx);core.list.setSiteInput(ctx.siteId??'');get('domain-search').value=ctx.search;
  for(const option of get('page-size').querySelectorAll('option'))option.selected=option.value===String(ctx.pageSize);
  return changed||force?core.list.reload():Promise.resolve();
 }
 async function sync(force=false){
  const key=nav.location?.hash??'';if(lastRoute===key)return;siteView?.hide();portView?.hide();packageView?.hide();lastRoute=key;const next=parseHostRoute(nav.location),pending=applyContext(next.context,force);
  if(next.id===null&&!next.invalidHostPages)core.back();else await core.open({id:next.id??'00000000-0000-4000-8000-000000000000',hostname:'Host details',os:null,os_version:null,first_seen_at:null,last_seen_at:null},{recordHistory:false,packagePage:next.packageDetailPage,portPage:next.portDetailPage,invalidHostPages:next.invalidHostPages});
  await pending;if(next.portRoute){await portView.restore(next.port,next.process,next.portPage,next.portInvalid);return;}if(next.packageRoute){await packageView.restore({id:next.packageId??''},next.id?{id:next.id}:null,next.packageSearch,next.packagePage,next.packageInvalid);return;}if(next.sitePicker){await siteView.restoreSite(next.selectedSite,next.pickerPage,next.siteSearch,next.siteHostPage,next.siteInvalid);return;}if(next.unassigned)await siteView.restoreUnassigned(next.unassignedSearch,next.unassignedPage,next.unassignedInvalid);
 }
 function navigate(id){
  const ctx=context();nav.history?.replaceState({atlasList:ctx},'',nav.location.pathname+fragment(null,ctx));
  nav.history?.pushState({atlasFromList:true,atlasList:ctx},'',nav.location.pathname+fragment(id,ctx));
  lastRoute=null;routePending=sync();
 }
 function back(){
  if(nav.history?.state?.atlasFromList){nav.history.back();return;}
  const ctx=parseHostRoute(nav.location).context;nav.history?.replaceState({atlasList:ctx},'',nav.location.pathname+fragment(null,ctx));lastRoute=null;routePending=sync();
 }
 core=mountInventoryDetail(document,{mode:'host',fetcher,initialState:route.context,manageHistory:false,resolveHost:true,onSelection:row=>navigate(row.id),onBack:back,onHostPage:(id,resource,page)=>{const parsed=parseHostRoute(nav.location),p=new URLSearchParams(fragment(id,context()).slice(1));p.set('package_detail_page',String(resource==='packages'?page:parsed.packageDetailPage));p.set('port_detail_page',String(resource==='listening-ports'?page:parsed.portDetailPage));nav.history?.pushState(null,'',nav.location.pathname+'#'+p);lastRoute=null;routePending=sync();},onListChange:ctx=>{nav.history?.pushState(null,'',nav.location.pathname+fragment(null,ctx));lastRoute=null;return routePending=sync(true);},onPackage:(row,host)=>packageView.open(row,host)});
 function packageBack(toList=false){const parsed=parseHostRoute(nav.location);nav.history?.pushState(null,'',nav.location.pathname+fragment(toList?null:parsed.id,context()));lastRoute=null;return routePending=sync();}
 packageView=mountPackageHosts(document,{fetcher,onHost:()=>packageBack(),onList:()=>packageBack(true),onNavigate:(row,host,search,page)=>{const p=new URLSearchParams(fragment(host?.id??null,context()).slice(1));p.set('package',row.id);p.set('package_search',search);p.set('package_page',String(page));nav.history?.pushState(null,'',nav.location.pathname+'#'+p);lastRoute=null;return routePending=sync();}});
 get('domain-search').value=route.context.search;for(const option of get('page-size').querySelectorAll('option'))option.selected=option.value===String(route.context.pageSize);
 const onRoute=()=>{routePending=sync();};nav.events?.addEventListener('popstate',onRoute);nav.events?.addEventListener('hashchange',onRoute);
 portView=mountPortSearch(document,{fetcher,onBack:()=>packageBack(),onNavigate:(port,process,page)=>{const parsed=parseHostRoute(nav.location),p=new URLSearchParams(fragment(parsed.id,context()).slice(1));p.set('port_search','1');if(port)p.set('port',port);if(process)p.set('process_search',process);p.set('port_page',String(page));nav.history?.pushState(null,'',nav.location.pathname+'#'+p);lastRoute=null;return routePending=sync();}});
 function unassignedNavigate(search,page){const parsed=parseHostRoute(nav.location),params=new URLSearchParams(fragment(parsed.id,context()).slice(1));params.set('unassigned','1');params.set('unassigned_search',search);params.set('unassigned_page',String(page));nav.history?.pushState(null,'',nav.location.pathname+'#'+params);lastRoute=null;return routePending=sync();}
 function unassignedBack(){const parsed=parseHostRoute(nav.location);nav.history?.pushState(null,'',nav.location.pathname+fragment(parsed.id,context()));lastRoute=null;return routePending=sync();}
 function siteNavigate(site,pickerPage,search,page){const parsed=parseHostRoute(nav.location),params=new URLSearchParams(fragment(parsed.id,context()).slice(1));params.set('site_picker','1');if(site)params.set('selected_site',site);params.set('picker_page',String(pickerPage));params.set('site_search',search);params.set('site_host_page',String(page));nav.history?.pushState(null,'',nav.location.pathname+'#'+params);lastRoute=null;return routePending=sync();}
 siteView=mountSiteHosts(document,{fetcher,onSiteNavigate:siteNavigate,onSiteBack:unassignedBack,onUnassignedNavigate:unassignedNavigate,onUnassignedBack:unassignedBack});
 const ready=Promise.all([core.ready,sync()]);
 return{ready,core,packageView,portView,siteView,navigate,back,settled:()=>routePending,destroy(){nav.events?.removeEventListener('popstate',onRoute);nav.events?.removeEventListener('hashchange',onRoute);siteView.destroy();portView.destroy();packageView.destroy();core.destroy();}};
}
