/**
 * Debug - Save HTML to file to inspect
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function saveHTML() {
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
    console.log('Loading page...');

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });

    // Get content
    const content = await page.content();
    
    // Save to file
    fs.writeFileSync('wireless-page.html', content);
    console.log('✓ Saved to wireless-page.html');

    // Find where first product data is
    const idx = content.indexOf('data-product-id');
    if (idx > -1) {
      console.log('\nFirst product found at position:', idx);
      console.log('\nContext (500 chars):');
      console.log(content.substring(Math.max(0, idx - 250), idx + 500));
    } else {
      console.log('No data-product-id found in content');
    }

    // Count data attributes
    const matches = content.match(/data-product-id/g);
    console.log(`\nTotal data-product-id occurrences: ${matches ? matches.length : 0}`);

    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
    if (browser) await browser.close();
  }
}

saveHTML();
