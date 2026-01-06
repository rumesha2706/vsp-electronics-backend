const db = require('../db');

async function checkProducts() {
  try {
    const result = await db.query(
      `SELECT DISTINCT TRIM(category) as category, COUNT(*) as count
       FROM products
       WHERE category IS NOT NULL AND category != ''
       GROUP BY TRIM(category)
       ORDER BY count DESC`
    );
    
    console.log('Product Categories in Database:\n');
    result.rows.forEach((cat) => {
      console.log(`${cat.category}: ${cat.count} products`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkProducts();
