/**
 * Update Product Counts in Categories
 * This script calculates and updates the product_count for each category
 */

const db = require('../db');

async function updateProductCounts() {
  try {
    console.log('Updating product counts for categories...\n');

    // Get all categories
    const categoriesResult = await db.query('SELECT id, name, slug FROM categories');
    console.log(`Found ${categoriesResult.rows.length} categories\n`);

    // For each category, count matching products
    for (const category of categoriesResult.rows) {
      try {
        // Count products that match this category
        // Match by exact name or partial match
        const countResult = await db.query(
          `SELECT COUNT(*) as count FROM products 
           WHERE LOWER(TRIM(category)) = LOWER(TRIM($1))
           OR LOWER(TRIM(category)) LIKE '%' || LOWER(TRIM($2)) || '%'`,
          [category.name, category.name]
        );

        const count = parseInt(countResult.rows[0].count);

        // Update the category with the count
        await db.query(
          'UPDATE categories SET product_count = $1 WHERE id = $2',
          [count, category.id]
        );

        console.log(`✓ ${category.name}: ${count} products`);
      } catch (err) {
        console.error(`✗ Error processing ${category.name}:`, err.message);
      }
    }

    console.log('\n✅ Product counts updated successfully\n');

    // Show summary
    console.log('📊 Category Summary:');
    const summary = await db.query(
      `SELECT name, product_count 
       FROM categories 
       WHERE display_on_home = true 
       ORDER BY display_order ASC`
    );

    summary.rows.forEach((cat, idx) => {
      console.log(`${idx + 1}. ${cat.name}: ${cat.product_count} products`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  updateProductCounts();
}

module.exports = { updateProductCounts };
