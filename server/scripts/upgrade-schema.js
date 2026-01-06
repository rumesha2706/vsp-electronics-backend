const db = require('../db');

async function upgrade() {
  try {
    console.log('Upgrading database schema...');
    
    // Products table upgrades
    console.log('\n📦 Upgrading products table...');
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;");
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB;");
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE;");
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hot BOOLEAN DEFAULT FALSE;");
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE;");
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;");
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1);");
    console.log('✓ Products table upgraded');
    
    // Categories table upgrades
    console.log('\n📂 Upgrading categories table...');
    await db.query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;");
    await db.query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;");
    await db.query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS product_count INTEGER DEFAULT 0;");
    console.log('✓ Categories table upgraded');
    
    // Brands table upgrades
    console.log('\n🏷️ Upgrading brands table...');
    await db.query("ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url TEXT;");
    await db.query("ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;");
    await db.query("ALTER TABLE brands ADD COLUMN IF NOT EXISTS product_count INTEGER DEFAULT 0;");
    console.log('✓ Brands table upgraded');
    
    console.log('\n✅ Schema upgrade complete');
    process.exit(0);
  } catch (err) {
    console.error('Schema upgrade failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) upgrade();
