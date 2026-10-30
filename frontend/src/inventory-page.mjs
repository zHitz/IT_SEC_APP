import {mountViewBookmarks} from './view-bookmarks.mjs';
import {mountDomainNavigation} from './domain-navigation.mjs';
try { document.documentElement.dataset.theme=localStorage.getItem('atlas.theme')==='light'?'light':'dark'; } catch { /* Theme remains usable without storage. */ }
document.getElementById('theme').addEventListener('click',()=>{
 const theme=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=theme;
 try { localStorage.setItem('atlas.theme',theme); } catch { /* Optional persistence. */ }
});
mountViewBookmarks(document);
mountDomainNavigation(document);
