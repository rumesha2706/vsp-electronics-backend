/**
 * Product Import Script
 * Imports product data from old TypeScript data files into the database
 * Run after database migration: node scripts/import-products-to-db.js
 * 
 * This script:
 * 1. Reads all product data from the backup directory
 * 2. Validates and normalizes the data
 * 3. Inserts products into the database
 * 4. Creates or updates category records
 */

const db = require('./server/db/index');
const fs = require('fs');
const path = require('path');

// Product data mappings from old data files
// This is extracted from the backup files
const PRODUCT_DATA_MAPPING = {
  'printer3dparts': {
    category: '3D Printers Parts',
    slug: '3d-printers-parts',
    dataFile: '3d-printers-parts-data.ts'
  },
  'acmotor': {
    category: 'AC Motor',
    slug: 'ac-motor',
    dataFile: 'ac-motor-data.ts'
  },
  'accessories': {
    category: 'Accessories',
    slug: 'accessories',
    dataFile: 'accessories-data.ts'
  },
  'accessoriesconnectors': {
    category: 'Accessories > Connectors',
    slug: 'accessories-connectors',
    parentSlug: 'accessories',
    dataFile: 'accessories-connectors-data.ts'
  },
  'antenna': {
    category: 'Antenna',
    slug: 'antenna',
    dataFile: 'antenna-data.ts'
  },
  'audiojack': {
    category: 'Audio Jack',
    slug: 'audio-jack',
    dataFile: 'audio-jack-data.ts'
  },
  'battery': {
    category: 'Battery',
    slug: 'battery',
    dataFile: 'battery-data.ts'
  },
  'bms': {
    category: 'BMS',
    slug: 'bms',
    dataFile: 'bms-data.ts'
  },
  'dronetransmiter': {
    category: 'Drone Transmitter Receiver',
    slug: 'drone-transmitter-receiver',
    dataFile: 'drone-transmiter-receiver-data.ts'
  },
  'rpiaccessories': {
    category: 'RPi Accessories',
    slug: 'rpi-accessories',
    dataFile: 'rpi-accessories-data.ts'
  },
  'shieldaccessories': {
    category: 'Shield Accessories',
    slug: 'shield-accessories',
    dataFile: 'shield-accessories-data.ts'
  },
  'wheels': {
    category: 'Wheels',
    slug: 'wheels',
    dataFile: 'wheels-data.ts'
  },
  'wirelessmodules': {
    category: 'Wireless Modules',
    slug: 'wireless-modules',
    dataFile: 'wireless-modules.ts'
  }
};

async function importProductData() {
  let client;
  try {
    console.log('🔄 Starting product import from backup files...\n');

    client = await db.connect();
    
    // Check if products table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ Products table does not exist. Run database migration first.');
      process.exit(1);
    }

    const backupDir = path.join(__dirname, '../.backup');
    const backupFolders = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('product-data-backup-'))
      .sort()
      .reverse(); // Most recent first

    if (backupFolders.length === 0) {
      console.error('❌ No backup folders found. Run backup-product-data.js first.');
      process.exit(1);
    }

    const latestBackup = path.join(backupDir, backupFolders[0]);
    console.log(`📁 Using backup: ${backupFolders[0]}\n`);

    let totalImported = 0;
    let categoriesCreated = 0;

    // Import products from each category
    for (const [key, mapping] of Object.entries(PRODUCT_DATA_MAPPING)) {
      try {
        const backupFile = path.join(latestBackup, mapping.dataFile);

        if (!fs.existsSync(backupFile)) {
          console.log(`⚠ File not found: ${mapping.dataFile}`);
          continue;
        }

        console.log(`📦 Processing: ${mapping.category}...`);

        // Read and parse the backup file (it's a TypeScript export)
        const content = fs.readFileSync(backupFile, 'utf-8');
        
        // Extract the exported constant name (first const declaration)
        const constMatch = content.match(/export const (\w+) = \[/);
        if (!constMatch) {
          console.log(`⚠ Could not find export in: ${mapping.dataFile}`);
          continue;
        }

        // Extract the data array (between [ and last ])
        const arrayMatch = content.match(/export const \w+ = (\[[\s\S]*\]);/);
        if (!arrayMatch) {
          console.log(`⚠ Could not parse data array in: ${mapping.dataFile}`);
          continue;
        }

        // Safely evaluate the data
        let products = [];
        try {
          // Remove TypeScript type annotations and evaluate
          const jsData = arrayMatch[1]
            .replace(/:\s*string|:\s*number|:\s*boolean/g, '') // Remove type annotations
            .replace(/'/g, '"'); // Convert single quotes to double
          
          products = eval('(' + jsData + ')');
        } catch (parseError) {
          console.log(`⚠ Could not parse products in: ${mapping.dataFile}`);
          console.log(`   Error: ${parseError.message}`);
          continue;
        }

        if (!Array.isArray(products) || products.length === 0) {
          console.log(`⚠ No products found in: ${mapping.dataFile}`);
          continue;
        }

        // Ensure category exists
        const categoryResult = await client.query(
          `INSERT INTO categories (name, slug, parent_slug)
           VALUES ($1, $2, $3)
           ON CONFLICT (slug) DO UPDATE SET name = $1
           RETURNING id`,
          [mapping.category, mapping.slug, mapping.parentSlug || null]
        );

        const categoryId = categoryResult.rows[0].id;
        categoriesCreated++;

        // Insert products
        let categoryImported = 0;
        for (const product of products) {
          try {
            await client.query(
              `INSERT INTO products 
               (id, name, price, original_price, category_id, brand, rating, in_stock, is_hot, is_new, image, about_product, description)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
               ON CONFLICT (id) DO UPDATE SET name = $2, updated_at = NOW()`,
              [
                product.id,
                product.name,
                product.price || 0,
                product.originalPrice || null,
                categoryId,
                product.brand || 'Generic',
                product.rating || 0,
                product.inStock !== false,
                product.isHot || false,
                product.isNew || false,
                product.image || null,
                product.aboutProduct || null,
                product.description || null
              ]
            );
            categoryImported++;
          } catch (productError) {
            console.log(`   ⚠ Skipped product ${product.id}: ${productError.message}`);
          }
        }

        totalImported += categoryImported;
        console.log(`   ✓ Imported ${categoryImported} products\n`);

      } catch (categoryError) {
        console.error(`❌ Error processing ${mapping.category}:`, categoryError.message);
      }
    }

    console.log('\n✅ Import completed!');
    console.log(`📊 Total products imported: ${totalImported}`);
    console.log(`📁 Categories created: ${categoriesCreated}`);
    console.log('\n🔐 Next steps:');
    console.log('1. Verify imports: SELECT COUNT(*) FROM products;');
    console.log('2. Update frontend to use ProductDataService');
    console.log('3. Remove old data files from src/app/data/');
    console.log('4. Test the application');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.release();
    }
  }
}

// Run the import
importProductData();
