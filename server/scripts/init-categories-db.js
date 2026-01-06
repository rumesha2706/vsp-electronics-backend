/**
 * Initialize Categories Database
 * Creates tables and seeds initial data
 */

require('dotenv').config();
const categoriesModel = require('../db/categories-model');
const db = require('../db/index');

async function initializeDatabase() {
  try {
    console.log('🔄 Creating categories database tables...');
    
    // Drop tables if they exist (for fresh reset)
    await db.query('DROP TABLE IF EXISTS category_routes CASCADE;');
    await db.query('DROP TABLE IF EXISTS subcategories CASCADE;');
    await db.query('DROP TABLE IF EXISTS brands CASCADE;');
    await db.query('DROP TABLE IF EXISTS categories CASCADE;');
    console.log('✓ Dropped existing tables');

    await categoriesModel.createTables();
    console.log('✅ Database tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
