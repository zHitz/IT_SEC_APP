const paths=['/inventory/hosts','/inventory/domains'];
const key=path=>'atlas.inventory.view:'+path;
const safe=value=>typeof value==='string'&&value.startsWith('#')&&value.length<=16384&&!/[\u0000-\u001f\u007f]/.test(value)?value:'';
// Store only this tab's navigation fragment. Never copy data rows or credentials.
export function mountViewBookmarks(document,{navigation,storage}={}){
 const view=document.defaultView,nav=navigation??{location:view.location,events:view};
 if(storage===undefined)try{storage=view.sessionStorage;}catch{storage=null;}
 const read=path=>{try{return safe(storage?.getItem(key(path)));}catch{return '';}};
 const save=()=>{if(!paths.includes(nav.location.pathname))return;try{storage?.setItem(key(nav.location.pathname),safe(nav.location.hash)||'#list=1');}catch{/* Explicit URLs remain usable if session storage is unavailable. */}};
 const links=[...document.querySelectorAll('nav[aria-label="Primary navigation"] a')].filter(a=>paths.includes(a.getAttribute('href')?.split('#')[0]));
 const refresh=()=>{save();for(const a of links){const path=a.getAttribute('href').split('#')[0];a.setAttribute('href',path+(path===nav.location.pathname?safe(nav.location.hash):read(path)));}};
 // pushState does not emit hashchange, so read the current fragment at the click itself.
 const leave=()=>refresh();for(const a of links)a.addEventListener('click',leave);
 for(const event of ['hashchange','popstate','pageshow'])nav.events?.addEventListener(event,refresh);
 nav.events?.addEventListener('pagehide',save);refresh();
 return{save,refresh,destroy(){for(const a of links)a.removeEventListener('click',leave);for(const event of ['hashchange','popstate','pageshow'])nav.events?.removeEventListener(event,refresh);nav.events?.removeEventListener('pagehide',save);}};
}
