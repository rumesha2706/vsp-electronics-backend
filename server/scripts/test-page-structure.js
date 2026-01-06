/**
 * Test page structure to identify product selectors
 */

const puppeteer = require('puppeteer');

async function analyzePageStructure() {
  let browser;
  try {
    console.log('🔍 Analyzing page structure...\n');
    
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

    // Get page title and check for products
    const title = await page.title();
    console.log(`Page Title: ${title}\n`);

    // Check for various product selectors
    const selectors = [
      'li.product',
      '[data-product-id]',
      'div.product',
      '.woocommerce-loop-product',
      '.woo-product-item',
      'article.product-item',
      '.products li',
      '.products > div',
      '.product-listing li',
      '.grid li'
    ];

    console.log('Checking selectors:\n');
    for (const selector of selectors) {
      const count = await page.evaluate((sel) => {
        return document.querySelectorAll(sel).length;
      }, selector);
      
      if (count > 0) {
        console.log(`✓ "${selector}": Found ${count} elements`);
      }
    }

    // Get HTML snippet to see structure
    console.log('\n📄 HTML Structure Sample:\n');
    const htmlSample = await page.evaluate(() => {
      // Get parent of products
      let container = document.querySelector('main') || 
                      document.querySelector('.content') || 
                      document.querySelector('.page-content') ||
                      document.querySelector('.products-container');
      
      if (container) {
        return container.innerHTML.substring(0, 2000);
      }
      
      return document.body.innerHTML.substring(0, 2000);
    });

    console.log(htmlSample);
    console.log('\n...\n');

    // Check if page is accessible
    const pageUrl = await page.url();
    console.log(`✓ Successfully accessed: ${pageUrl}`);

    // Count all links that might be products
    const allLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .filter(a => a.href.includes('/product/') || a.href.includes('/p/'))
        .length;
    });

    console.log(`Total product-like links found: ${allLinks}\n`);

    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
    if (browser) await browser.close();
  }
}

analyzePageStructure();
