/**
 * Wireless Modules Scraper - With proper wait and selector
 */

const puppeteer = require('puppeteer');
const db = require('../db');

const BASE_URL = 'https://www.agarwalelectronics.com/product-category/accessories/wireless-modules';

async function scrapeWirelessModules() {
  let browser;
  try {
    console.log('🚀 Starting Puppeteer...\n');
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const products = [];

    // Scrape pages 1-3
    for (let page = 1; page <= 3; page++) {
      const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
      console.log(`📄 Page ${page}: ${url.replace('https://www.agarwalelectronics.com', '')}`);

      try {
        const browser_page = await browser.newPage();
        
        await browser_page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        await browser_page.setViewport({ width: 1920, height: 1080 });

        // Navigate with network idle
        await browser_page.goto(url, { 
          waitUntil: 'networkidle0',
          timeout: 45000 
        });

        // Wait longer for JS to render products
        console.log('  ⏳ Waiting for products to render...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Try multiple selectors to find products
        const pageProducts = await browser_page.evaluate(() => {
          const products = [];
          
          // Try to find product links that contain actual product info
          const allElements = Array.from(document.querySelectorAll('[data-product-id]'));
          
          allElements.forEach(el => {
            try {
              // Get product ID
              const productId = el.getAttribute('data-product-id');
              if (!productId) return;

              // Look for title/name - try various selectors within this element
              let name = '';
              let nameEl = el.querySelector('h2');
              if (!nameEl) nameEl = el.querySelector('.woocommerce-loop-product__title');
              if (!nameEl) nameEl = el.querySelector('a.woocommerce-loop-product__link');
              if (!nameEl) nameEl = el.querySelector('a.product');
              
              if (nameEl) {
                name = (nameEl.textContent || nameEl.getAttribute('title') || nameEl.getAttribute('aria-label') || '').trim();
              }

              // Look for price
              let price = 0;
              const priceEl = el.querySelector('.woocommerce-Price-amount');
              if (priceEl) {
                const priceStr = priceEl.textContent.trim();
                const nums = priceStr.match(/[\d,]+(\.\d+)?/);
                if (nums) price = parseFloat(nums[0].replace(/,/g, ''));
              }

              // Get product URL
              let productUrl = '';
              const links = el.querySelectorAll('a');
              for (let link of links) {
                const href = link.getAttribute('href');
                if (href && href.includes('/product/')) {
                  productUrl = href;
                  break;
                }
              }

              // Get image
              let image = '';
              const img = el.querySelector('img');
              if (img) {
                image = img.src || img.getAttribute('data-src') || '';
              }

              // Only add if we have name and URL
              if (name && name.length > 2 && productUrl) {
                products.push({
                  name: name.substring(0, 255),
                  price,
                  productUrl,
                  image
                });
              }
            } catch (e) {
              // Skip
            }
          });

          return products;
        });

        console.log(`  ✓ Found ${pageProducts.length} products`);
        
        if (pageProducts.length > 0) {
          pageProducts.slice(0, 2).forEach(p => {
            console.log(`    • ${p.name.substring(0, 50)} - ₹${p.price || 'N/A'}`);
          });
        }

        products.push(...pageProducts);
        await browser_page.close();
      } catch (pageErr) {
        console.error(`  ✗ Error: ${pageErr.message}`);
      }

      // Delay between pages
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await browser.close();
    console.log(`\n✅ Total scraped: ${products.length} products\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found.');
      process.exit(0);
    }

    // Deduplicate
    const unique = [];
    const urls = new Set();
    products.forEach(p => {
      if (!urls.has(p.productUrl)) {
        urls.add(p.productUrl);
        unique.push(p);
      }
    });

    console.log(`📊 After dedup: ${unique.length} unique products\n`);

    // Import to database
    console.log('💾 Importing to database...\n');
    
    let imported = 0;
    let skipped = 0;

    for (const product of unique) {
      try {
        const result = await db.query(
          `INSERT INTO products (name, category, price, image, product_url, description, in_stock)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (product_url) DO UPDATE SET
             price = EXCLUDED.price,
             image = EXCLUDED.image
           RETURNING id`,
          [
            product.name,
            'Wireless Modules',
            product.price || 0,
            product.image || '/assets/images/placeholder.jpg',
            product.productUrl,
            'Wireless communication module',
            true
          ]
        );

        if (result.rows.length > 0) {
          imported++;
          if (imported <= 5 || imported % 10 === 0) {
            console.log(`✓ ${product.name.substring(0, 60)}`);
          }
        }
      } catch (err) {
        skipped++;
      }
    }

    if (unique.length > 5) {
      console.log(`... and ${unique.length - 5} more\n`);
    }

    console.log(`\n📊 Results:`);
    console.log(`  ✓ Imported: ${imported}`);
    console.log(`  ⊘ Skipped: ${skipped}`);

    // Update category count
    const countResult = await db.query(
      `SELECT COUNT(*) as cnt FROM products WHERE category = 'Wireless Modules'`
    );
    const finalCount = parseInt(countResult.rows[0].cnt);

    await db.query(
      `UPDATE categories SET product_count = $1 WHERE LOWER(name) = 'wireless modules'`,
      [finalCount]
    );

    console.log(`\n🏷️  Category: Wireless Modules - ${finalCount} total products`);
    console.log('\n✅ Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

scrapeWirelessModules();
