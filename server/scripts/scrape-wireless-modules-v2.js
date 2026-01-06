/**
 * Advanced Wireless Modules Scraper using Puppeteer
 * Handles dynamic content and ModSecurity restrictions
 */

const puppeteer = require('puppeteer');
const db = require('../db');

const BASE_URL = 'https://www.agarwalelectronics.com/product-category/accessories/wireless-modules';

async function scrapeWithPuppeteer() {
  let browser;
  try {
    console.log('🚀 Starting Puppeteer browser...\n');
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const products = [];

    // Scrape pages 1-3
    for (let page = 1; page <= 3; page++) {
      const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
      console.log(`📄 Scraping page ${page}: ${url}`);

      try {
        const browser_page = await browser.newPage();
        
        // Set user agent to bypass ModSecurity
        await browser_page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );
        
        // Set viewport
        await browser_page.setViewport({ width: 1920, height: 1080 });

        // Navigate to page with extended timeout
        console.log('  ⏳ Loading page...');
        await browser_page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });

        // Wait for products to load
        await browser_page.waitForSelector('[data-product-id], li.product, .woo-variation-swatches', { 
          timeout: 10000 
        }).catch(() => console.log('  ⚠️  No wait selector found, continuing...'));

        // Extract product data using page.evaluate
        const pageProducts = await browser_page.evaluate(() => {
          const items = [];
          
          // Use known working selectors
          const elements = document.querySelectorAll('[data-product-id]');
          console.log(`Found ${elements.length} elements with [data-product-id]`);

          elements.forEach(el => {
            try {
              // Get name - look in various places
              let name = '';
              let nameEl = el.querySelector('h2');
              if (!nameEl) nameEl = el.querySelector('.woocommerce-loop-product__title');
              if (!nameEl) nameEl = el.querySelector('.product-title');
              if (!nameEl) nameEl = el.querySelector('a');
              
              if (nameEl) {
                name = nameEl.textContent.trim() || nameEl.getAttribute('title') || nameEl.getAttribute('alt');
              }
              
              // Get price
              let price = 0;
              const priceEl = el.querySelector('.woocommerce-Price-amount');
              if (priceEl) {
                const priceText = priceEl.textContent.trim();
                const match = priceText.match(/[\d,]+\.?\d*/);
                if (match) price = parseFloat(match[0].replace(/,/g, ''));
              }

              // Get URL - look for product link
              let product_url = '';
              const linkEl = el.querySelector('a[href]');
              if (linkEl && linkEl.href) {
                product_url = linkEl.href;
              }

              // Get image
              let image = '';
              const imgEl = el.querySelector('img');
              if (imgEl) {
                image = imgEl.src || imgEl.dataset.src || imgEl.getAttribute('data-src');
              }

              // Only add if we have meaningful data
              if (name && name.length > 3 && product_url) {
                items.push({
                  name: name.substring(0, 255),
                  price: price,
                  product_url: product_url,
                  image: image || ''
                });
              }
            } catch (e) {
              // Skip problematic items
              console.error('Error parsing item:', e.message);
            }
          });

          return items;
        });

        products.push(...pageProducts);
        console.log(`  ✓ Found ${pageProducts.length} products on page ${page}`);
        
        pageProducts.slice(0, 3).forEach(p => {
          console.log(`    - ${p.name} (₹${p.price})`);
        });

        await browser_page.close();
      } catch (pageErr) {
        console.error(`  ✗ Error on page ${page}:`, pageErr.message);
      }

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await browser.close();
    console.log(`\n✅ Total products scraped: ${products.length}\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Please check selectors.');
      process.exit(0);
    }

    // Remove duplicates
    const uniqueProducts = [];
    const urls = new Set();
    
    products.forEach(p => {
      if (!urls.has(p.product_url)) {
        urls.add(p.product_url);
        uniqueProducts.push(p);
      }
    });

    console.log(`📊 After deduplication: ${uniqueProducts.length} unique products\n`);

    // Import to database
    console.log('💾 Importing to database...\n');
    
    let imported = 0;
    let duplicates = 0;

    for (const product of uniqueProducts) {
      try {
        const result = await db.query(
          `INSERT INTO products (name, category, price, image, product_url, description, in_stock, is_featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (product_url) DO UPDATE SET
             price = EXCLUDED.price,
             image = EXCLUDED.image
           RETURNING id`,
          [
            product.name,
            'Wireless Modules',
            product.price || 0,
            product.image || '/assets/images/placeholder.jpg',
            product.product_url,
            'Wireless module from Agarwal Electronics',
            true,
            false
          ]
        );

        if (result.rows.length > 0) {
          imported++;
          console.log(`✓ ${product.name}`);
        }
      } catch (err) {
        if (err.message.includes('duplicate') || err.message.includes('UNIQUE')) {
          duplicates++;
        } else {
          console.error(`✗ ${product.name}: ${err.message}`);
        }
      }
    }

    console.log(`\n📊 Import Results:`);
    console.log(`  ✓ New products: ${imported}`);
    console.log(`  ⚠️  Already exists: ${duplicates}`);

    // Update category
    console.log(`\n🏷️  Updating category...\n`);
    
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM products WHERE category = 'Wireless Modules'`
    );
    const count = parseInt(countResult.rows[0].count);

    const catResult = await db.query(
      `UPDATE categories 
       SET product_count = $1
       WHERE LOWER(name) = 'wireless modules'
       RETURNING id`,
      [count]
    );

    if (catResult.rows.length > 0) {
      console.log(`✓ Wireless Modules: ${count} products`);
    } else {
      const insertCat = await db.query(
        `INSERT INTO categories (name, slug, description, display_on_home, display_order, product_count)
         VALUES ('Wireless Modules', 'wireless-modules', 'Wireless communication modules and components', false, 99, $1)
         ON CONFLICT (slug) DO UPDATE SET product_count = $1
         RETURNING id`,
        [count]
      );
      console.log(`+ Created Wireless Modules category with ${count} products`);
    }

    console.log('\n✅ Wireless Modules scraping complete!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

if (require.main === module) {
  scrapeWithPuppeteer();
}

module.exports = { scrapeWithPuppeteer };
