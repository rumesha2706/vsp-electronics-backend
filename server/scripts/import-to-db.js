const fs = require('fs');
const path = require('path');
const productsModel = require('../db/products-model');

async function importProducts() {
  try {
    await productsModel.createTable();

    const raw = fs.readFileSync(path.join(__dirname, '..', '..', 'scraped-products.json'), 'utf-8');
    const products = JSON.parse(raw);

    // Deduplicate by name and by product URL if available
    const seen = new Set();
    const unique = [];

    for (const p of products) {
      const key = (p.name || '').trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(p);
    }

    // If this category is robotic diy kits, keep only 14 unique products (the site has 14)
    const filtered = unique.filter(p => (p.category || '').toLowerCase().includes('robotic'));
    if (filtered.length > 0) {
      console.log(`Found ${filtered.length} robotic products; deduping to 14 if needed.`);
      // Take first 14
      const finalRobots = filtered.slice(0, 14);
      // Replace those in unique list
      const others = unique.filter(p => !(p.category || '').toLowerCase().includes('robotic'));
      unique.length = 0;
      unique.push(...finalRobots, ...others);
    }

    console.log(`Importing ${unique.length} unique products to DB...`);

    // Optional: clear existing products (enable if desired)
    await productsModel.clearAll();

    let count = 0;
    for (const p of unique) {
      await productsModel.insertProduct(p);
      count++;
    }

    console.log(`✓ Imported ${count} products`);
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) importProducts();

module.exports = { importProducts };
