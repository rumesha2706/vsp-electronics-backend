/**
 * Download all product images locally and update database paths
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const crypto = require('crypto');

const IMAGES_DIR = path.join(__dirname, '../../public/assets/images/products');
const LOCAL_URL_PREFIX = '/assets/images/products';

// Ensure directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`✓ Created directory: ${IMAGES_DIR}\n`);
}

async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const filePath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(filePath, response.data);
    
    return {
      success: true,
      localPath: `${LOCAL_URL_PREFIX}/${filename}`,
      filename: filename
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

function generateFilename(url, id) {
  // Extract filename from URL or generate one
  try {
    const urlParts = url.split('/');
    let filename = urlParts[urlParts.length - 1];
    
    // Remove query parameters
    filename = filename.split('?')[0];
    
    // If filename is empty or invalid, generate one
    if (!filename || filename.length < 3) {
      const ext = url.includes('.jpg') ? '.jpg' : 
                  url.includes('.png') ? '.png' : 
                  url.includes('.gif') ? '.gif' : '.jpg';
      filename = `product-${id}${ext}`;
    }
    
    return filename;
  } catch (e) {
    return `product-${id}.jpg`;
  }
}

async function downloadAllImages() {
  try {
    console.log('🚀 Downloading product images locally\n');

    // Get all products with image URLs
    const result = await db.query(
      `SELECT id, name, image FROM products 
       WHERE image IS NOT NULL AND image != '' AND image LIKE 'http%'
       ORDER BY id ASC`
    );

    const products = result.rows;
    console.log(`📦 Found ${products.length} products with external image URLs\n`);

    if (products.length === 0) {
      console.log('✓ No products with external URLs. Exiting.');
      process.exit(0);
    }

    let downloaded = 0;
    let failed = 0;
    let skipped = 0;

    console.log('⏳ Downloading images...\n');

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const { id, name, image } = product;

      try {
        // Skip if already local
        if (!image.includes('http')) {
          skipped++;
          continue;
        }

        // Generate filename
        const filename = generateFilename(image, id);

        // Check if already exists
        const filePath = path.join(IMAGES_DIR, filename);
        let localPath = `${LOCAL_URL_PREFIX}/${filename}`;

        if (!fs.existsSync(filePath)) {
          // Download image
          const downloadResult = await downloadImage(image, filename);
          
          if (!downloadResult.success) {
            console.log(`✗ Failed: ${name.substring(0, 50)} - ${downloadResult.error}`);
            failed++;
            
            // Update to placeholder on failure
            await db.query(
              `UPDATE products SET image = '/assets/images/placeholder.jpg' WHERE id = $1`,
              [id]
            );
            continue;
          }

          localPath = downloadResult.localPath;
        }

        // Update database
        await db.query(
          `UPDATE products SET image = $1 WHERE id = $2`,
          [localPath, id]
        );

        downloaded++;

        // Progress indicator
        if ((i + 1) % 10 === 0) {
          console.log(`✓ Downloaded ${i + 1}/${products.length} images...`);
        }
      } catch (err) {
        console.error(`✗ Error with product ${id}:`, err.message);
        failed++;
      }
    }

    console.log(`\n📊 Download Summary:`);
    console.log(`  ✓ Downloaded: ${downloaded}`);
    console.log(`  ✗ Failed: ${failed}`);
    console.log(`  ⊘ Already local: ${skipped}`);
    console.log(`  📁 Total: ${products.length}`);

    // Verify all images are local now
    console.log(`\n✅ Verifying all images are local...\n`);
    
    const externalCheck = await db.query(
      `SELECT COUNT(*) as count FROM products WHERE image LIKE 'http%'`
    );

    const externalCount = parseInt(externalCheck.rows[0].count);
    
    if (externalCount === 0) {
      console.log('✓ All product images are now local!');
      console.log(`✓ Images saved in: ${IMAGES_DIR}`);
      console.log(`✓ Database paths updated to: ${LOCAL_URL_PREFIX}/*`);
    } else {
      console.log(`⚠️  ${externalCount} products still have external URLs`);
    }

    console.log('\n✅ Image download complete!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

downloadAllImages();
