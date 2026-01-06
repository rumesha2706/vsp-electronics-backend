/**
 * Download images into category-specific folders and update database paths
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../db');

const BASE_DIR = path.join(__dirname, '../../public/assets/images/products');
const LOCAL_URL_PREFIX = '/assets/images/products';

async function downloadImageToCategory(url, category, filename) {
  try {
    // Create category folder
    const categoryFolder = path.join(BASE_DIR, category.toLowerCase().replace(/\s+/g, '-'));
    if (!fs.existsSync(categoryFolder)) {
      fs.mkdirSync(categoryFolder, { recursive: true });
    }

    // Download image
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const filePath = path.join(categoryFolder, filename);
    fs.writeFileSync(filePath, response.data);
    
    return {
      success: true,
      localPath: `${LOCAL_URL_PREFIX}/${category.toLowerCase().replace(/\s+/g, '-')}/${filename}`
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

function generateFilename(url, id) {
  try {
    const urlParts = url.split('/');
    let filename = urlParts[urlParts.length - 1];
    
    filename = filename.split('?')[0];
    
    if (!filename || filename.length < 3) {
      const ext = url.includes('.jpg') ? '.jpg' : 
                  url.includes('.png') ? '.png' : 
                  url.includes('.gif') ? '.gif' : 
                  url.includes('.webp') ? '.webp' : '.jpg';
      filename = `product-${id}${ext}`;
    }
    
    return filename;
  } catch (e) {
    return `product-${id}.jpg`;
  }
}

async function downloadCategoryImages() {
  try {
    console.log('🚀 Downloading images into category-specific folders\n');

    // Get all unique categories with products that have external images
    const categoryResult = await db.query(
      `SELECT DISTINCT category FROM products 
       WHERE category IS NOT NULL AND category != '' AND image LIKE 'http%'
       ORDER BY category ASC`
    );

    const categories = categoryResult.rows.map(r => r.category);
    console.log(`📦 Found ${categories.length} categories with external images\n`);

    let totalDownloaded = 0;
    let totalFailed = 0;

    for (const category of categories) {
      console.log(`\n📁 Category: ${category}`);
      
      // Get products in this category with external URLs
      const productsResult = await db.query(
        `SELECT id, name, image FROM products 
         WHERE category = $1 AND image LIKE 'http%'
         ORDER BY id ASC`,
        [category]
      );

      const products = productsResult.rows;
      console.log(`  Found ${products.length} products\n`);

      let categoryDownloaded = 0;
      let categoryFailed = 0;

      for (const product of products) {
        try {
          const filename = generateFilename(product.image, product.id);
          
          // Download to category folder
          const result = await downloadImageToCategory(product.image, category, filename);
          
          if (result.success) {
            // Update database with new path
            await db.query(
              `UPDATE products SET image = $1 WHERE id = $2`,
              [result.localPath, product.id]
            );
            
            categoryDownloaded++;
            totalDownloaded++;
            console.log(`  ✓ ${product.name.substring(0, 60)}`);
          } else {
            console.log(`  ✗ Failed: ${product.name.substring(0, 50)}`);
            categoryFailed++;
            totalFailed++;
          }
        } catch (err) {
          console.error(`  ✗ Error: ${err.message}`);
          categoryFailed++;
          totalFailed++;
        }
      }

      console.log(`  ✅ Category summary: ${categoryDownloaded} downloaded, ${categoryFailed} failed`);
    }

    console.log(`\n\n📊 Overall Summary:`);
    console.log(`  ✓ Total Downloaded: ${totalDownloaded}`);
    console.log(`  ✗ Total Failed: ${totalFailed}`);
    console.log(`  📁 Storage: ${BASE_DIR}`);

    // Show wireless modules sample
    console.log(`\n🔌 Wireless Modules sample:`);
    const wirelessSample = await db.query(
      `SELECT name, image FROM products WHERE category = 'Wireless Modules' LIMIT 3`
    );
    
    wirelessSample.rows.forEach(p => {
      console.log(`  • ${p.name.substring(0, 60)}`);
      console.log(`    ${p.image}`);
    });

    console.log('\n✅ Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

downloadCategoryImages();
