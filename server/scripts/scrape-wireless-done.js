/**
 * Wireless Modules Scraper - FINAL WORKING VERSION
 * Uses correct CSS selectors based on actual HTML structure
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const db = require('../db');

const BASE_URL = 'https://www.agarwalelectronics.com/product-category/accessories/wireless-modules';

async function scrapeWirelessModules() {
  let browser;
  try {
    console.log('🚀 Scraping Wireless Modules\n');
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const allProducts = [];

    // Scrape pages 1-3
    for (let page = 1; page <= 3; page++) {
      const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
      console.log(`📄 Page ${page}...`);

      const browserPage = await browser.newPage();
      
      await browserPage.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );

      try {
        await browserPage.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });

        // Get page content
        const content = await browserPage.content();
        const $ = cheerio.load(content);

        // Find all product elements using correct selector
        const products = [];
        $('.product-grid-item.product').each((idx, el) => {
          try {
            // Get product title and URL from h3.wd-entities-title > a
            const $titleLink = $(el).find('h3.wd-entities-title a');
            const name = $titleLink.text().trim();
            const productUrl = $titleLink.attr('href');
            
            if (!name || !productUrl) return;
            
            // Get product image
            let image = '';
            const $img = $(el).find('.product-image-link img').first();
            if ($img.length) {
              image = $img.attr('src') || $img.attr('data-src') || '';
            }
            
            // Price is typically not shown on category pages for this store
            // But we'll look for it anyway
            let price = 0;
            const $priceEl = $(el).find('.woocommerce-Price-amount bdi');
            if ($priceEl.length) {
              const priceText = $priceEl.text().trim().replace(/[^0-9.]/g, '');
              price = parseFloat(priceText) || 0;
            }
            
            products.push({
              name: name.substring(0, 255),
              price: price,
              productUrl: productUrl,
              image: image || '/assets/images/placeholder.jpg'
            });
          } catch (e) {
            // Skip problematic items
          }
        });

        allProducts.push(...products);
        console.log(`  ✓ Found ${products.length} products`);
        
        // Show first few products
        products.slice(0, 3).forEach(p => {
          console.log(`    • ${p.name.substring(0, 65)}`);
        });

      } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
      }

      await browserPage.close();
      
      // Delay between pages
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    await browser.close();

    console.log(`\n✅ Total scraped: ${allProducts.length} products\n`);

    if (allProducts.length === 0) {
      console.log('⚠️  No products found.');
      process.exit(0);
    }

    // Remove duplicates
    const unique = [];
    const urls = new Set();
    allProducts.forEach(p => {
      if (!urls.has(p.productUrl)) {
        urls.add(p.productUrl);
        unique.push(p);
      }
    });

    console.log(`📊 Unique products: ${unique.length}\n`);

    // Import to database
    console.log('💾 Importing to database...\n');
    
    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (let i = 0; i < unique.length; i++) {
      const product = unique[i];
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
            product.image,
            product.productUrl,
            'Wireless communication module',
            true
          ]
        );

        if (result.rows.length > 0) {
          imported++;
        }
        
        // Show progress every 5 items
        if ((i + 1) % 5 === 0 || i === unique.length - 1) {
          console.log(`✓ Processed ${i + 1}/${unique.length} products`);
        }
      } catch (err) {
        if (err.message.includes('unique') || err.message.includes('duplicate')) {
          updated++;
        } else {
          errors++;
        }
      }
    }

    console.log(`\n📊 Import Results:`);
    console.log(`  ✓ Imported: ${imported}`);
    console.log(`  ⚠️  Updated: ${updated}`);
    console.log(`  ✗ Errors: ${errors}`);

    // Update category
    console.log(`\n🏷️  Updating category...\n`);
    
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM products WHERE LOWER(category) = 'wireless modules'`
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
      console.log(`✓ Updated: Wireless Modules (${count} products)`);
    } else {
      // Create category if missing
      await db.query(
        `INSERT INTO categories (name, slug, description, display_on_home, display_order, product_count)
         VALUES ('Wireless Modules', 'wireless-modules', 'Wireless communication modules and components', false, 99, $1)
         ON CONFLICT (slug) DO UPDATE SET product_count = $1
         RETURNING id`,
        [count]
      );
      console.log(`+ Created: Wireless Modules (${count} products)`);
    }

    console.log(`\n✅ Complete!`);
    console.log(`\n🎉 Access at: http://localhost:4300/category/wireless-modules\n`);

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

scrapeWirelessModules();
