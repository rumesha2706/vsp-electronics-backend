/**
 * Reorganize existing images into category folders and update database paths
 */

const fs = require('fs');
const path = require('path');
const db = require('../db');

const BASE_DIR = path.join(__dirname, '../../public/assets/images/products');
const LOCAL_URL_PREFIX = '/assets/images/products';

async function reorganizeImages() {
  try {
    console.log('🚀 Reorganizing images into category folders\n');

    // Get all products with local image paths
    const result = await db.query(
      `SELECT id, category, name, image FROM products 
       WHERE image LIKE '/assets/images/products/%' AND category IS NOT NULL AND category != ''
       ORDER BY category ASC, id ASC`
    );

    const products = result.rows;
    console.log(`📦 Found ${products.length} products to reorganize\n`);

    let moved = 0;
    let errors = 0;

    // Group by category
    const byCategory = {};
    products.forEach(p => {
      if (!byCategory[p.category]) {
        byCategory[p.category] = [];
      }
      byCategory[p.category].push(p);
    });

    // Process each category
    for (const [category, categoryProducts] of Object.entries(byCategory)) {
      const categoryFolder = path.join(BASE_DIR, category.toLowerCase().replace(/\s+/g, '-'));
      
      // Create category folder if it doesn't exist
      if (!fs.existsSync(categoryFolder)) {
        fs.mkdirSync(categoryFolder, { recursive: true });
      }

      console.log(`\n📁 ${category} (${categoryProducts.length} products)`);

      for (const product of categoryProducts) {
        try {
          // Extract filename from current path
          const currentImagePath = product.image;
          const filename = path.basename(currentImagePath);
          
          const oldPath = path.join(BASE_DIR, filename);
          const newPath = path.join(categoryFolder, filename);

          // If file exists in main folder, move it
          if (fs.existsSync(oldPath) && oldPath !== newPath) {
            fs.copyFileSync(oldPath, newPath);
            fs.unlinkSync(oldPath);
          }

          // Update database with new path
          const newImagePath = `${LOCAL_URL_PREFIX}/${category.toLowerCase().replace(/\s+/g, '-')}/${filename}`;
          
          await db.query(
            `UPDATE products SET image = $1 WHERE id = $2`,
            [newImagePath, product.id]
          );

          moved++;

          if (moved % 20 === 0) {
            console.log(`  ✓ Processed ${moved} images...`);
          }
        } catch (err) {
          console.error(`  ✗ Error with ${product.name}: ${err.message}`);
          errors++;
        }
      }
    }

    console.log(`\n\n📊 Reorganization Summary:`);
    console.log(`  ✓ Moved/Updated: ${moved}`);
    console.log(`  ✗ Errors: ${errors}`);

    // Show results by category
    console.log(`\n📋 Categories organized:`);
    for (const category of Object.keys(byCategory).sort()) {
      const count = byCategory[category].length;
      const folder = category.toLowerCase().replace(/\s+/g, '-');
      console.log(`  • ${category}: ${count} products -> /assets/images/products/${folder}/`);
    }

    // Verify Wireless Modules
    console.log(`\n🔌 Wireless Modules verification:`);
    const wirelessCheck = await db.query(
      `SELECT name, image FROM products WHERE category = 'Wireless Modules' LIMIT 5`
    );
    
    wirelessCheck.rows.forEach(p => {
      console.log(`  • ${p.name.substring(0, 60)}`);
      console.log(`    ${p.image}`);
    });

    // List category folders
    console.log(`\n📁 Checking created folders:`);
    const folders = fs.readdirSync(BASE_DIR);
    const dirs = folders.filter(f => {
      const fullPath = path.join(BASE_DIR, f);
      return fs.statSync(fullPath).isDirectory();
    });
    
    dirs.forEach(dir => {
      const files = fs.readdirSync(path.join(BASE_DIR, dir));
      console.log(`  📂 ${dir} (${files.length} images)`);
    });

    console.log('\n✅ Reorganization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

reorganizeImages();
