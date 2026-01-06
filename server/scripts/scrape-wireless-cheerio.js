/**
 * Wireless Modules Scraper using cheerio to parse page content
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const db = require('../db');

const BASE_URL = 'https://www.agarwalelectronics.com/product-category/accessories/wireless-modules';

async function scrapeWirelessModules() {
  let browser;
  try {
    console.log('🚀 Scraping Wireless Modules from Agarwal Electronics\n');
    
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

        // Get page content and parse with cheerio
        const content = await browserPage.content();
        const $ = cheerio.load(content);

        // Find all product elements
        const products = [];
        $('[data-product-id]').each((idx, el) => {
          try {
            // Get title from h3.wd-entities-title > a
            const $titleEl = $(el).find('h3.wd-entities-title a');
            const name = $titleEl.text().trim();
            const productUrl = $titleEl.attr('href');
            
            if (!name || !productUrl) return;
            
            // Get price
            let price = 0;
            const priceText = $(el).find('.woocommerce-Price-amount bdi').text().trim();
            if (priceText) {
              const nums = priceText.replace(/[^0-9.]/g, '');
              price = parseFloat(nums) || 0;
            }
            
            // Get image
            let image = '';
            const $imgEl = $(el).find('img').first();
            if ($imgEl.length) {
              image = $imgEl.attr('src') || $imgEl.attr('data-src') || '';
            }
            
            products.push({
              name: name.substring(0, 255),
              price: price,
              productUrl: productUrl,
              image: image || '/assets/images/placeholder.jpg'
            });
          } catch (e) {
            // Skip
          }
        });

        allProducts.push(...products);
        console.log(`  ✓ Found ${products.length} products`);
        
        // Show first 3
        products.slice(0, 3).forEach(p => {
          console.log(`    • ${p.name.substring(0, 60)}`);
        });

      } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
      }

      await browserPage.close();
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    await browser.close();

    console.log(`\n✅ Total scraped: ${allProducts.length} products\n`);

    if (allProducts.length === 0) {
      console.log('⚠️  No products found. Exiting.');
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
            product.image,
            product.productUrl,
            'Wireless communication module from Agarwal Electronics',
            true
          ]
        );

        if (result.rows.length > 0) {
          imported++;
          if (imported % 5 === 1) {
            console.log(`✓ ${product.name.substring(0, 70)}`);
          }
        }
      } catch (err) {
        if (err.message.includes('unique') || err.message.includes('duplicate')) {
          updated++;
        } else {
          errors++;
        }
      }
    }

    if (unique.length > 5) {
      const remaining = unique.length - 5;
      console.log(`... and ${remaining} more products imported\n`);
    }

    // Update category
    console.log(`\n🏷️  Updating category count...`);
    
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
      await db.query(
        `INSERT INTO categories (name, slug, description, display_on_home, display_order, product_count)
         VALUES ('Wireless Modules', 'wireless-modules', 'Wireless modules and components', false, 99, $1)
         ON CONFLICT (slug) DO UPDATE SET product_count = $1`,
        [count]
      );
      console.log(`+ Created: Wireless Modules category (${count} products)`);
    }

    console.log(`\n✅ Complete!`);
    console.log(`\nSummary:`);
    console.log(`  Imported: ${imported}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Errors: ${errors}`);
    console.log(`  Total in category: ${count}`);
    console.log(`\n🎉 Access at: http://localhost:4300/category/wireless-modules`);

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

scrapeWirelessModules();
