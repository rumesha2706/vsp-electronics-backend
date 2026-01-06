const http = require('http');
function get(url){return new Promise((res,rej)=>{http.get(url,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(d));}).on('error',e=>rej(e));});}

(async()=>{
  try{
    const raw = await get('http://127.0.0.1:3000/api/products?limit=1000');
    const parsed = JSON.parse(raw);
    const products = parsed.data || parsed;
    const cats = {};
    products.forEach(p=>{ if(p.category) cats[p.category] = (cats[p.category]||0)+1 });
    const list = Object.keys(cats).sort((a,b)=>cats[b]-cats[a]);
    console.log('Total categories:', list.length);
    console.log('\nCategories matching /drone/i or /mini/i:');
    list.filter(c=>/drone/i.test(c)||/mini/i.test(c)).forEach(c=>console.log(' -',c,'->',cats[c]));
    console.log('\nTop 20 categories:');
    list.slice(0,20).forEach(c=>console.log(' -',c,'->',cats[c]));
  }catch(e){
    console.error('ERROR',e.message||e);
  }
})();