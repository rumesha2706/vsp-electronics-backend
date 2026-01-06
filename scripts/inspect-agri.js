const axios = require('axios');

(async function(){
  try {
    const url = 'https://www.agarwalelectronics.com/product-category/agriculture-drone-parts/';
    console.log('Fetching:', url);
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9' };
    const res = await axios.get(url, { timeout: 15000, headers });
    const html = res.data;
    console.log('Length:', html.length);

    const checks = [
      'woocommerce-LoopProduct-link',
      'class="product"',
      'class="products"',
      'data-product',
      'product_title',
      'wp-post-image'
    ];

    checks.forEach(c => {
      console.log(`${c}:`, html.includes(c));
    });

    // Print a small snippet around the first occurrence of 'class="products"' if present
    const idx = html.indexOf('class="products"');
    if (idx !== -1) {
      console.log('\nsnippet around class="products":\n');
      console.log(html.slice(idx - 200, idx + 400));
    }

    // Print snippet around first 'data-product' occurrence
    const idx2 = html.indexOf('data-product');
    if (idx2 !== -1) {
      console.log('\nsnippet around data-product:\n');
      console.log(html.slice(idx2 - 200, idx2 + 400));
    }

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();