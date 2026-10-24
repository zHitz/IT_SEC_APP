import {mountInventoryTable} from './inventory-table.mjs';
try{document.documentElement.dataset.theme=localStorage.getItem('atlas.theme')==='light'?'light':'dark';}catch{}
document.getElementById('theme').addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=theme;try{localStorage.setItem('atlas.theme',theme);}catch{}});
mountInventoryTable(document,{mode:'host'});
