const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../db');
const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const axios = require('axios');

// Use the pool from db module
const pool = db.pool;

// Configuration
const BATCH_SIZE = 5; // Process in small batches to avoid detection
const DELAY_MS = 5000; // Increased delay to be safer
const OUTPUT_DIR = path.join(__dirname, '../public/uploads/products/auto');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadImage(url, filename) {
    const filePath = path.join(OUTPUT_DIR, filename);
    const writer = fs.createWriteStream(filePath);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(`/uploads/products/auto/${filename}`));
            writer.on('error', reject);
        });
    } catch (error) {
        // console.error(`Failed to download ${url}:`, error.message);
        return null;
    }
}

async function scrapeProductInfo(browser, productName) {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    try {
        // 1. Search Google Images
        console.log(`Searching images for: ${productName}`);
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(productName)}&tbm=isch`, { waitUntil: 'networkidle2' });

        // Extract image URLs (try to get high-res if possible, but thumbnails are easier)
        // This selector targets Google Images results. It often changes.
        // We'll try a generic approach grabbing the 'src' of results.
        const imageUrls = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            // Filter out small icons/logos
            return images
                .map(img => img.src)
                .filter(src => src && src.startsWith('http') && !src.includes('google') && !src.includes('gstatic'))
                .slice(0, 4);
        });

        console.log(`Found ${imageUrls.length} potential images for ${productName}`);
        if (imageUrls.length === 0) {
            const debugPath = path.join(__dirname, `debug_${productName.replace(/[^a-z0-9]/gi, '_')}.png`);
            await page.screenshot({ path: debugPath });
            console.log(`Saved failure screenshot to ${debugPath}`);
        }

        // 2. Simplistic Price Check (Google Shopping or Search)
        // Note: Parsing prices is highly site-specific. We'll skip complex price scraping for now to avoid bad data.
        // We could try to look for pricing schema on the first result, but it's risky.

        await page.close();
        return imageUrls;
    } catch (err) {
        console.error(`Error scraping ${productName}:`, err.message);
        await page.close();
        return [];
    }
}

async function enrichProducts() {
    const client = await pool.connect();
    let browser;

    try {
        // Fetch products that have placeholder images or no images
        // Adjust query as needed. For now, let's just do a few for testing.
        const res = await client.query(`
      SELECT id, name FROM products 
      WHERE (image IS NULL OR image = '' OR image LIKE '%placeholder%')
      AND name NOT ILIKE 'Test%'
      LIMIT ${BATCH_SIZE}
    `);

        const products = res.rows;
        console.log(`Found ${products.length} products to enrich.`);

        if (products.length === 0) return;

        browser = await puppeteer.launch({ headless: true }); // set false to debug

        for (const product of products) {
            console.log(`Processing [${product.id}] ${product.name}...`);

            const foundImageUrls = await scrapeProductInfo(browser, product.name);
            const savedImagePaths = [];

            // Download images
            for (let i = 0; i < foundImageUrls.length; i++) {
                const ext = 'jpg'; // assume jpg for simplicity
                const filename = `${product.id}_${i}_${Date.now()}.${ext}`;
                const savedPath = await downloadImage(foundImageUrls[i], filename);
                if (savedPath) savedImagePaths.push(savedPath);
            }

            if (savedImagePaths.length > 0) {
                // Update DB
                // Set first image as main, rest as gallery in metadata
                const mainImage = savedImagePaths[0];
                const metadataImages = savedImagePaths;

                await client.query(`
          UPDATE products 
          SET image = $1, 
              metadata = jsonb_set(COALESCE(metadata, '{}'), '{images}', $2)
          WHERE id = $3
        `, [mainImage, JSON.stringify(metadataImages), product.id]);

                console.log(`Updated product ${product.id} with ${savedImagePaths.length} images.`);
            } else {
                console.log(`No images found/downloaded for ${product.name}`);
            }

            // Delay to be polite
            await new Promise(r => setTimeout(r, DELAY_MS));
        }

    } catch (err) {
        console.error('Enrichment failed:', err);
    } finally {
        if (browser) await browser.close();
        client.release();
        pool.end();
    }
}

enrichProducts();
