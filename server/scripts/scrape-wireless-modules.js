/**
 * Scraper for Wireless Modules Products
 * Fetches products from Agarwal Electronics wireless modules category
 */

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../db');

const BASE_URL = 'https://www.agarwalelectronics.com/product-category/accessories/wireless-modules';

async function scrapeWirelessModules() {
  try {
    console.log('🔄 Scraping Wireless Modules products...\n');

    const products = [];
    
    // Scrape pages 1-3
    for (let page = 1; page <= 3; page++) {
      const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
      console.log(`Fetching page ${page}: ${url}`);

      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Find all product elements
        const items = $('.product-item, .product, .woocommerce-loop-product__title, [data-product-id]');
        console.log(`  Found ${items.length} items on page ${page}`);

        // Try different selectors
        const productSelector = 'li.product, div.product-item, article.product-item';
        $(productSelector).each((index, element) => {
          try {
            const $item = $(element);
            
            // Extract product details
            const titleEl = $item.find('h2.woocommerce-loop-product__title, .product-title, a.product-name');
            const name = titleEl.text().trim() || $item.find('a').first().attr('title');
            
            const priceEl = $item.find('.price, .product-price, .woocommerce-Price-amount');
            const priceText = priceEl.text().trim();
            
            const linkEl = $item.find('a.woocommerce-loop-product__link, a.product-link, a[href*="/product/"]').first();
            const product_url = linkEl.attr('href');
            
            const imgEl = $item.find('img').first();
            const image = imgEl.attr('src') || imgEl.attr('data-src');

            if (name && (priceText || product_url)) {
              // Extract price value
              const priceMatch = priceText.match(/[\d,]+\.?\d*/);
              const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;

              const product = {
                name: name.substring(0, 255),
                category: 'Wireless Modules',
                price: price,
                image: image || '/assets/images/products/placeholder.jpg',
                product_url: product_url,
                description: `Wireless module from Agarwal Electronics`,
                in_stock: true,
                is_new: false,
                is_featured: false,
                is_hot: false,
                rating: 0
              };

              products.push(product);
              console.log(`    ✓ ${product.name} - ₹${product.price}`);
            }
          } catch (itemErr) {
            // Skip problematic items
          }
        });
      } catch (pageErr) {
        console.error(`  ✗ Error on page ${page}:`, pageErr.message);
      }

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Scraped ${products.length} products total\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Exiting.');
      process.exit(0);
    }

    // Import products to database
    console.log('📦 Importing to database...\n');
    
    let imported = 0;
    let duplicates = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const result = await db.query(
          `INSERT INTO products (name, category, price, image, product_url, description, in_stock, is_hot, is_new, is_featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (product_url) DO UPDATE SET
             price = EXCLUDED.price,
             image = EXCLUDED.image,
             description = EXCLUDED.description
           RETURNING id`,
          [
            product.name,
            product.category,
            product.price,
            product.image,
            product.product_url,
            product.description,
            product.in_stock,
            product.is_hot,
            product.is_new,
            product.is_featured
          ]
        );

        if (result.rows.length > 0) {
          imported++;
          console.log(`✓ ${product.name}`);
        }
      } catch (err) {
        if (err.message.includes('duplicate')) {
          duplicates++;
        } else {
          errors++;
          console.error(`✗ Error importing ${product.name}:`, err.message);
        }
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`  ✓ Imported: ${imported}`);
    console.log(`  ⚠️  Duplicates (skipped): ${duplicates}`);
    console.log(`  ✗ Errors: ${errors}`);

    // Update category product count
    console.log(`\n🔢 Updating product count for Wireless Modules category...`);
    
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM products WHERE category = 'Wireless Modules'`
    );
    const count = parseInt(countResult.rows[0].count);

    const catUpdate = await db.query(
      `UPDATE categories 
       SET product_count = $1 
       WHERE LOWER(name) = 'wireless modules'
       RETURNING id`,
      [count]
    );

    if (catUpdate.rows.length > 0) {
      console.log(`✓ Wireless Modules category: ${count} products`);
    } else {
      // Create category if it doesn't exist
      await db.query(
        `INSERT INTO categories (name, slug, category, display_on_home, display_order)
         VALUES ('Wireless Modules', 'wireless-modules', 'Accessories', false, 99)
         ON CONFLICT (name) DO NOTHING`
      );
      console.log(`+ Created Wireless Modules category with ${count} products`);
    }

    console.log('\n✅ Wireless Modules import complete!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  scrapeWirelessModules();
}

module.exports = { scrapeWirelessModules };
