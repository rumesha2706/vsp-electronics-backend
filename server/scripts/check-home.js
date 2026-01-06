const db = require('../db');

async function checkHome() {
  try {
    const result = await db.query(
      `SELECT id, name, product_count, display_order 
       FROM categories 
       WHERE display_on_home = true 
       ORDER BY display_order ASC`
    );
    
    console.log('Categories on Home Page:\n');
    result.rows.forEach((cat, idx) => {
      console.log(`${idx + 1}. ${cat.name}: ${cat.product_count} products`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkHome();
