const axios = require('axios');

(async function(){
  try {
    const url = 'https://www.agarwalelectronics.com/product/drone-spray-nozzle-4810/';
    console.log('Fetching:', url);
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' };
    const res = await axios.get(url, { timeout: 15000, headers });
    const html = res.data;
    console.log('Length:', html.length);

    const checks = ['woocommerce-Price-amount','price','meta property="og:price:amount"','meta itemprop="price"','data-price','class="price"'];
    checks.forEach(c => console.log(c+':', html.includes(c)));

    const idx3 = html.indexOf('class="price"');
    if (idx3 !== -1) console.log('\nsnippet around class="price":\n', html.slice(idx3-200, idx3+400));

    const idx = html.indexOf('woocommerce-Price-amount');
    if (idx !== -1) console.log('\nsnippet around woocommerce-Price-amount:\n', html.slice(idx-200, idx+400));

    const idx2 = html.indexOf('data-price');
    if (idx2 !== -1) console.log('\nsnippet around data-price:\n', html.slice(idx2-200, idx2+400));

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();