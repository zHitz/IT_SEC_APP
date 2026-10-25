export function navigation(hash){
 const events=new EventTarget();let stack=[{url:new URL('http://local/inventory/domains'+hash),state:null}],index=0;
 const nav={events,get location(){return stack[index].url;}};
 nav.history={get state(){return stack[index].state;},replaceState(state,_title,url){stack[index]={url:new URL(url,stack[index].url),state};},pushState(state,_title,url){stack=stack.slice(0,index+1);stack.push({url:new URL(url,stack[index].url),state});index++;},back(){if(index>0){index--;events.dispatchEvent(new Event('popstate'));}},forward(){if(index<stack.length-1){index++;events.dispatchEvent(new Event('popstate'));}}};return nav;
}
