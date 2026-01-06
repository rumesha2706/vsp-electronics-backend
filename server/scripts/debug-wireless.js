/**
 * Debug script - Extract actual product data from wireless modules page
 */

const puppeteer = require('puppeteer');

async function debugProducts() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    const url = 'https://www.agarwalelectronics.com/product-category/accessories/wireless-modules';
    console.log(`Loading: ${url}\n`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Debug: Get element count
    const elementCount = await page.evaluate(() => {
      return document.querySelectorAll('[data-product-id]').length;
    });

    console.log(`Elements with [data-product-id]: ${elementCount}\n`);

    if (elementCount === 0) {
      console.log('❌ No elements found. Checking alternative selectors...\n');
      
      const altCount = await page.evaluate(() => {
        return document.querySelectorAll('div.product').length;
      });
      console.log(`Elements with div.product: ${altCount}`);
      
      return;
    }

    // Get first product details
    const products = await page.evaluate(() => {
      const prods = [];
      const elements = document.querySelectorAll('[data-product-id]');
      
      for (let i = 0; i < Math.min(3, elements.length); i++) {
        const el = elements[i];
        const dataId = el.getAttribute('data-product-id');
        const innerHTML = el.innerHTML.substring(0, 500);
        
        prods.push({
          dataProductId: dataId,
          htmlSnippet: innerHTML,
          allText: el.textContent.substring(0, 200)
        });
      }
      
      return prods;
    });

    console.log('Sample products:');
    products.forEach((p, i) => {
      console.log(`\nProduct ${i + 1}:`);
      console.log(`  Data ID: ${p.dataProductId}`);
      console.log(`  Text: ${p.allText}`);
      console.log(`  HTML: ${p.htmlSnippet.substring(0, 300)}`);
    });

    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
    if (browser) await browser.close();
  }
}

debugProducts();
