import {mountFlaggedDomains} from './flagged-domains.mjs';
import {mountDnsValueSearch} from './dns-value-search.mjs';
import {mountInventoryDetail} from './inventory-detail.mjs';
export function parseDomainRoute(location){
 const params=new URLSearchParams((location?.hash??'').replace(/^#/,''));
 const integer=(key,fallback,max)=>/^[1-9]\d*$/.test(params.get(key)??'')&&Number(params.get(key))<=max?Number(params.get(key)):fallback;
 const raw=params.get('search')??'';const search=raw.length<=200&&!/[\u0000-\u001f\u007f]/.test(raw)?raw.trim():'';
 const size=integer('page_size',25,100),pageSize=[10,25,50,100].includes(size)?size:25;
 const id=params.has('domain')?(params.get('domain')??''):params.has('detail')?(params.get('detail')??''):null;
 const childOwner=params.get('flagged_owner')??null,childPage=params.has('child_page')?integer('child_page',0,100000):1;const childInvalid=params.getAll('flagged_owner').length>1||params.getAll('child_page').length>1||(childOwner!==null&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(childOwner))||!childPage||(params.has('child_page')&&!childOwner);
 const flagged=params.has('flagged_owner')||params.has('child_page')||params.has('flagged')||params.has('flagged_search')||params.has('flagged_page');
 const flaggedSearch=params.get('flagged_search')??'';const flaggedPage=params.has('flagged_page')?integer('flagged_page',0,100000):1;
 const flaggedInvalid=flagged&&(childInvalid||params.getAll('flagged').length!==1||params.get('flagged')!=='1'||params.getAll('flagged_search').length>1||params.getAll('flagged_page').length>1||!flaggedPage||flaggedSearch.length>200||/[\u0000-\u001f\u007f]/.test(flaggedSearch)||params.has('value_search'));
 return{childOwner,childPage,flagged,flaggedSearch,flaggedPage,flaggedInvalid,valueSearch:params.has('value_search')?(params.getAll('value_search').length===1?params.get('value_search'):'\u0000'):null,dnsPage:integer('dns_page',1,100000),id:id===null?null:id.toLowerCase(),context:{resource:'domains',search,flag:['true','false'].includes(params.get('outside_known_range'))?params.get('outside_known_range'):'',page:integer('page',1,100000),pageSize}};
}
export function mountDomainNavigation(document,{fetcher=fetch,navigation}={}){
 const view=document.defaultView;
 const nav=navigation??{history:view.history,location:view.location,events:view};
 const route=parseDomainRoute(nav.location);let flaggedView,valueView,core,lastRoute=null,routePending=Promise.resolve();
 const get=id=>document.getElementById(id);
 const context=()=>({resource:'domains',search:core.list.state.search,flag:core.list.state.flag,page:core.list.state.page,pageSize:core.list.state.pageSize});
 function fragment(id,ctx){const p=new URLSearchParams(id===null?{list:'1'}:{domain:id});if(ctx.search)p.set('search',ctx.search);if(ctx.flag)p.set('outside_known_range',ctx.flag);p.set('page',String(ctx.page));p.set('page_size',String(ctx.pageSize));return'#'+p;}
 function applyContext(ctx){
  const changed=['resource','search','flag','page','pageSize'].some(k=>core.list.state[k]!==ctx[k]);
  Object.assign(core.list.state,ctx);get('domain-search').value=ctx.search;for(const option of get('range-filter').querySelectorAll('option'))option.selected=option.value===ctx.flag;
  for(const option of get('page-size').querySelectorAll('option'))option.selected=option.value===String(ctx.pageSize);
  return changed?core.list.reload():Promise.resolve();
 }
 async function sync(){
  const key=nav.location?.hash??'';if(lastRoute===key)return;flaggedView?.hide();valueView?.hide();lastRoute=key;const next=parseDomainRoute(nav.location),pending=applyContext(next.context);
  if(next.id===null)core.back();else await core.open({id:next.id,fqdn:'Domain details',source:null,confidence:null,tags:[],first_seen_at:null,last_seen_at:null},{recordHistory:false});
  await pending;if(next.flagged){await flaggedView.restore(next.flaggedSearch,next.flaggedPage,next.flaggedInvalid,next.childOwner,next.childPage);return;}if(next.valueSearch!==null)await valueView.restore(next.valueSearch,next.dnsPage);
 }
 function navigate(id){
  const ctx=context();nav.history?.replaceState({atlasList:ctx},'',nav.location.pathname+fragment(null,ctx));
  nav.history?.pushState({atlasFromList:true,atlasList:ctx},'',nav.location.pathname+fragment(id,ctx));
  lastRoute=null;routePending=sync();
 }
 function back(){
  if(nav.history?.state?.atlasFromList){nav.history.back();return;}
  const ctx=parseDomainRoute(nav.location).context;nav.history?.replaceState({atlasList:ctx},'',nav.location.pathname+fragment(null,ctx));lastRoute=null;routePending=sync();
 }
 core=mountInventoryDetail(document,{mode:'domain',fetcher,initialState:route.context,manageHistory:false,onSelection:row=>navigate(row.id),onBack:back});
 get('domain-search').value=route.context.search;for(const option of get('range-filter').querySelectorAll('option'))option.selected=option.value===route.context.flag;for(const option of get('page-size').querySelectorAll('option'))option.selected=option.value===String(route.context.pageSize);
 const onRoute=()=>{routePending=sync();};nav.events?.addEventListener('popstate',onRoute);nav.events?.addEventListener('hashchange',onRoute);
 function valueNavigate(value,page){
  const parsed=parseDomainRoute(nav.location),params=new URLSearchParams(fragment(parsed.id,context()).slice(1));params.set('value_search',value);params.set('dns_page',String(page));
  nav.history?.pushState({atlasValueSearch:true},'',nav.location.pathname+'#'+params);lastRoute=null;return routePending=sync();
 }
 function valueBack(){const parsed=parseDomainRoute(nav.location);nav.history?.pushState(null,'',nav.location.pathname+fragment(parsed.id,context()));lastRoute=null;return routePending=sync();}
 valueView=mountDnsValueSearch(document,{onNavigate:valueNavigate,onBack:valueBack});valueView.setFetcher(fetcher);
 function flaggedNavigate(search,page,owner=null,childPage=1){const parsed=parseDomainRoute(nav.location),params=new URLSearchParams(fragment(parsed.id,context()).slice(1));params.set('flagged','1');params.set('flagged_search',search);params.set('flagged_page',String(page));if(owner){params.set('flagged_owner',owner);params.set('child_page',String(childPage));}nav.history?.pushState(null,'',nav.location.pathname+'#'+params);lastRoute=null;return routePending=sync();}
 flaggedView=mountFlaggedDomains(document,{fetcher,onNavigate:flaggedNavigate,onBack:valueBack});
 const ready=Promise.all([core.ready,sync()]);
 return{ready,core,valueView,flaggedView,navigate,back,settled:()=>routePending,destroy(){nav.events?.removeEventListener('popstate',onRoute);nav.events?.removeEventListener('hashchange',onRoute);flaggedView.destroy();valueView.destroy();core.destroy();}};
}
