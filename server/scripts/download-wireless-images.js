/**
 * Download Wireless Modules images from Agarwal Electronics
 * Scrape images from pages 1-3 and save locally
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../db');

const BASE_URL = 'https://www.agarwalelectronics.com/product-category/accessories/wireless-modules';
const IMAGES_DIR = path.join(__dirname, '../../public/assets/images/products/wireless-modules');

// Ensure directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`✓ Created directory: ${IMAGES_DIR}\n`);
}

async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const filePath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(filePath, response.data);
    
    return {
      success: true,
      filename: filename,
      size: response.data.length
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

function generateFilename(url, index) {
  try {
    const urlParts = url.split('/');
    let filename = urlParts[urlParts.length - 1];
    filename = filename.split('?')[0];
    
    if (!filename || filename.length < 3) {
      const ext = url.includes('.jpg') ? '.jpg' : 
                  url.includes('.png') ? '.png' : 
                  url.includes('.gif') ? '.gif' : 
                  url.includes('.webp') ? '.webp' : '.jpg';
      filename = `wireless-module-${index}${ext}`;
    }
    
    return filename;
  } catch (e) {
    return `wireless-module-${index}.jpg`;
  }
}

async function scrapeAndDownloadImages() {
  let browser;
  try {
    console.log('🚀 Scraping Wireless Modules images from Agarwal Electronics\n');
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const allImages = [];
    let imageIndex = 0;

    // Scrape pages 1-3
    for (let page = 1; page <= 3; page++) {
      const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
      console.log(`📄 Scraping page ${page}...`);

      const browserPage = await browser.newPage();
      
      await browserPage.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );

      try {
        await browserPage.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });

        // Get page content
        const content = await browserPage.content();
        const $ = cheerio.load(content);

        // Find all product images
        $('.product-grid-item.product img').each((idx, el) => {
          try {
            let imageUrl = $(el).attr('src') || $(el).attr('data-src');
            
            if (imageUrl && imageUrl.includes('http')) {
              // Remove query parameters
              imageUrl = imageUrl.split('?')[0];
              
              // Avoid duplicates
              if (!allImages.includes(imageUrl)) {
                allImages.push(imageUrl);
              }
            }
          } catch (e) {
            // Skip
          }
        });

        console.log(`  ✓ Found ${allImages.length} total images so far`);
        await browserPage.close();
      } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    await browser.close();

    console.log(`\n✅ Total unique images found: ${allImages.length}\n`);

    if (allImages.length === 0) {
      console.log('⚠️  No images found.');
      process.exit(0);
    }

    // Download all images
    console.log('⏳ Downloading images...\n');
    
    let downloaded = 0;
    let failed = 0;

    for (let i = 0; i < allImages.length; i++) {
      const imageUrl = allImages[i];
      const filename = generateFilename(imageUrl, i + 1);
      
      try {
        const result = await downloadImage(imageUrl, filename);
        
        if (result.success) {
          downloaded++;
          if (downloaded % 5 === 0) {
            console.log(`✓ Downloaded ${downloaded}/${allImages.length} images...`);
          }
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n📊 Download Summary:`);
    console.log(`  ✓ Downloaded: ${downloaded}`);
    console.log(`  ✗ Failed: ${failed}`);
    console.log(`  📁 Location: ${IMAGES_DIR}`);

    // Update database - get wireless modules products and update image paths
    console.log(`\n🔄 Updating database paths...\n`);

    const wirelessProducts = await db.query(
      `SELECT id, name FROM products WHERE category = 'Wireless Modules'`
    );

    console.log(`  Found ${wirelessProducts.rows.length} Wireless Modules products`);

    // List downloaded files
    const files = fs.readdirSync(IMAGES_DIR);
    console.log(`  Local images: ${files.length} files\n`);

    console.log('📋 Sample downloaded images:');
    files.slice(0, 10).forEach(f => {
      const filePath = path.join(IMAGES_DIR, f);
      const size = fs.statSync(filePath).size;
      console.log(`  • ${f} (${(size / 1024).toFixed(1)} KB)`);
    });

    if (files.length > 10) {
      console.log(`  ... and ${files.length - 10} more images`);
    }

    console.log('\n✅ Image download complete!');
    console.log(`\n🎯 Path: /assets/images/products/wireless-modules/`);
    console.log(`📂 Total images: ${files.length}`);

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

scrapeAndDownloadImages();
