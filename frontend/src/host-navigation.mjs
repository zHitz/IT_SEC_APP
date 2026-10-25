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
 return{packageId,packageSearch,packagePage,packageRoute,packageInvalid,sitePicker,selectedSite,pickerPage,siteHostPage,siteSearch,siteInvalid,unassigned,unassignedSearch,unassignedPage,unassignedInvalid,id:id===null?null:id.toLowerCase(),context:{resource:'hosts',search,page:integer('page',1,100000),pageSize}};
}
export function mountHostNavigation(document,{fetcher=fetch,navigation}={}){
 const view=document.defaultView;
 const nav=navigation??{history:view.history,location:view.location,events:view};
 const route=parseHostRoute(nav.location);let siteView,portView,packageView,core,lastRoute=null,routePending=Promise.resolve();
 const get=id=>document.getElementById(id);
 const context=()=>({resource:'hosts',search:core.list.state.search,page:core.list.state.page,pageSize:core.list.state.pageSize});
 function fragment(id,ctx){const p=new URLSearchParams(id===null?{list:'1'}:{host:id});if(ctx.search)p.set('search',ctx.search);p.set('page',String(ctx.page));p.set('page_size',String(ctx.pageSize));return'#'+p;}
 function applyContext(ctx){
  const changed=['resource','search','page','pageSize'].some(k=>core.list.state[k]!==ctx[k]);
  Object.assign(core.list.state,ctx);get('domain-search').value=ctx.search;
  for(const option of get('page-size').querySelectorAll('option'))option.selected=option.value===String(ctx.pageSize);
  return changed?core.list.reload():Promise.resolve();
 }
 async function sync(){
  const key=nav.location?.hash??'';if(lastRoute===key)return;siteView?.hide();portView?.hide();packageView?.hide();lastRoute=key;const next=parseHostRoute(nav.location),pending=applyContext(next.context);
  if(next.id===null)core.back();else await core.open({id:next.id,hostname:'Host details',os:null,os_version:null,first_seen_at:null,last_seen_at:null},{recordHistory:false});
  await pending;if(next.packageRoute){await packageView.restore({id:next.packageId??''},next.id?{id:next.id}:null,next.packageSearch,next.packagePage,next.packageInvalid);return;}if(next.sitePicker){await siteView.restoreSite(next.selectedSite,next.pickerPage,next.siteSearch,next.siteHostPage,next.siteInvalid);return;}if(next.unassigned)await siteView.restoreUnassigned(next.unassignedSearch,next.unassignedPage,next.unassignedInvalid);
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
 core=mountInventoryDetail(document,{mode:'host',fetcher,initialState:route.context,manageHistory:false,resolveHost:true,onSelection:row=>navigate(row.id),onBack:back,onPackage:(row,host)=>packageView.open(row,host)});
 function packageBack(toList=false){const parsed=parseHostRoute(nav.location);nav.history?.pushState(null,'',nav.location.pathname+fragment(toList?null:parsed.id,context()));lastRoute=null;return routePending=sync();}
 packageView=mountPackageHosts(document,{fetcher,onHost:()=>packageBack(),onList:()=>packageBack(true),onNavigate:(row,host,search,page)=>{const p=new URLSearchParams(fragment(host?.id??null,context()).slice(1));p.set('package',row.id);p.set('package_search',search);p.set('package_page',String(page));nav.history?.pushState(null,'',nav.location.pathname+'#'+p);lastRoute=null;return routePending=sync();}});
 get('domain-search').value=route.context.search;for(const option of get('page-size').querySelectorAll('option'))option.selected=option.value===String(route.context.pageSize);
 const onRoute=()=>{routePending=sync();};nav.events?.addEventListener('popstate',onRoute);nav.events?.addEventListener('hashchange',onRoute);
 portView=mountPortSearch(document,{fetcher});
 function unassignedNavigate(search,page){const parsed=parseHostRoute(nav.location),params=new URLSearchParams(fragment(parsed.id,context()).slice(1));params.set('unassigned','1');params.set('unassigned_search',search);params.set('unassigned_page',String(page));nav.history?.pushState(null,'',nav.location.pathname+'#'+params);lastRoute=null;return routePending=sync();}
 function unassignedBack(){const parsed=parseHostRoute(nav.location);nav.history?.pushState(null,'',nav.location.pathname+fragment(parsed.id,context()));lastRoute=null;return routePending=sync();}
 function siteNavigate(site,pickerPage,search,page){const parsed=parseHostRoute(nav.location),params=new URLSearchParams(fragment(parsed.id,context()).slice(1));params.set('site_picker','1');if(site)params.set('selected_site',site);params.set('picker_page',String(pickerPage));params.set('site_search',search);params.set('site_host_page',String(page));nav.history?.pushState(null,'',nav.location.pathname+'#'+params);lastRoute=null;return routePending=sync();}
 siteView=mountSiteHosts(document,{fetcher,onSiteNavigate:siteNavigate,onSiteBack:unassignedBack,onUnassignedNavigate:unassignedNavigate,onUnassignedBack:unassignedBack});
 const ready=Promise.all([core.ready,sync()]);
 return{ready,core,packageView,portView,siteView,navigate,back,settled:()=>routePending,destroy(){nav.events?.removeEventListener('popstate',onRoute);nav.events?.removeEventListener('hashchange',onRoute);siteView.destroy();portView.destroy();packageView.destroy();core.destroy();}};
}
