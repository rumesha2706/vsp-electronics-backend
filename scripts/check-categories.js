const http = require('http');
function get(url){return new Promise((res,rej)=>{http.get(url,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(d));}).on('error',e=>rej(e));});}

(async()=>{
  try{
    const all = JSON.parse(await get('http://127.0.0.1:3000/api/products?limit=1000'));
    const products = all.data||all;
    const slugs = ['diy-kits','mini-drone-kits','drone-transmiter-receiver','bonka','agriculture-drone-parts','raspberry'];
    for(const s of slugs){
      const api = JSON.parse(await get('http://127.0.0.1:3000/api/products?category='+encodeURIComponent(s)+'&limit=12'));
      const apiCount = api.pagination?.total ?? (Array.isArray(api)?api.length:0);
      const norm = s.toLowerCase().replace(/[-\/]+/g,' ').replace(/\s+/g,' ').trim();
      const localCount = products.filter(p=> ((p.category||'').toLowerCase().replace(/[-\/]+/g,' ').replace(/\s+/g,' ').trim().includes(norm) || norm.includes((p.category||'').toLowerCase().replace(/[-\/]+/g,' ').replace(/\s+/g,' ').trim()))).length;
      console.log(s,'api=>',apiCount,'local=>',localCount,(apiCount===0 && localCount>0)?'MISMATCH':'');
      if(apiCount===0 && localCount>0){
        console.log('  Sample matching local categories:');
        const samples = products.filter(p=> (p.category||'').toLowerCase().replace(/[-\/]+/g,' ').replace(/\s+/g,' ').trim().includes(norm)).slice(0,5).map(p=>p.category);
        console.log('   ',[...new Set(samples)]);
      }
    }
  }catch(e){console.error(e.message||e);}
})();