/**
 * Check if we can get page content at all
 */

const puppeteer = require('puppeteer');

async function checkPageContent() {
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
    console.log('Navigating...');

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });

    console.log('Page loaded. Checking content...\n');

    // Get page content
    const content = await page.content();
    console.log(`Total content length: ${content.length} chars\n`);

    // Check for key markers
    const hasProducts = content.includes('data-product-id');
    const hasWoocommerce = content.includes('woocommerce');
    const hasWishlist = content.includes('wishlist');
    const hasAddToCart = content.includes('Add to cart');
    const hasProductLink = content.includes('/product/');

    console.log('Content markers:');
    console.log(`  ✓ data-product-id: ${hasProducts}`);
    console.log(`  ✓ woocommerce: ${hasWoocommerce}`);
    console.log(`  ✓ wishlist: ${hasWishlist}`);
    console.log(`  ✓ Add to cart: ${hasAddToCart}`);
    console.log(`  ✓ /product/ links: ${hasProductLink}`);

    // Get first 3000 chars showing products section
    const productsIdx = content.indexOf('data-product-id');
    if (productsIdx > 0) {
      console.log('\n📄 Sample HTML around first product:\n');
      const sample = content.substring(productsIdx - 200, productsIdx + 800);
      console.log(sample);
    }

    // Count product elements in loaded content
    const productCount = (content.match(/data-product-id/g) || []).length;
    console.log(`\n✓ Found ${productCount} data-product-id markers in HTML`);

    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
    if (browser) await browser.close();
  }
}

checkPageContent();
