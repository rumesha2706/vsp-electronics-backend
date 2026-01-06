const db = require('../db/index');

async function initBrandCategories() {
  try {
    console.log('🔨 Creating brand categories and subcategories tables...\n');

    // Drop existing tables if they exist
    await db.query(`
      DROP TABLE IF EXISTS brand_category_items CASCADE;
      DROP TABLE IF EXISTS brand_categories CASCADE;
    `);
    console.log('✓ Dropped existing tables (if any)');

    // Create brand_categories table
    await db.query(`
      CREATE TABLE brand_categories (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(brand_id, slug)
      );
    `);
    console.log('✓ Created brand_categories table');

    // Create brand_category_items table (for subcategories under brand categories)
    await db.query(`
      CREATE TABLE brand_category_items (
        id SERIAL PRIMARY KEY,
        brand_category_id INTEGER NOT NULL REFERENCES brand_categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(brand_category_id, slug)
      );
    `);
    console.log('✓ Created brand_category_items table');

    // Create indexes for performance
    await db.query(`
      CREATE INDEX idx_brand_categories_brand_id ON brand_categories(brand_id);
      CREATE INDEX idx_brand_categories_slug ON brand_categories(slug);
      CREATE INDEX idx_brand_category_items_brand_category_id ON brand_category_items(brand_category_id);
    `);
    console.log('✓ Created indexes');

    console.log('\n✅ Brand category tables initialized successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

initBrandCategories();
