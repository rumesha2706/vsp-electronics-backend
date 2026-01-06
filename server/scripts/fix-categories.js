/**
 * Fix Category Mappings
 * Maps featured categories to actual product categories
 */

const db = require('../db');

async function fixCategories() {
  try {
    console.log('Fixing category mappings...\n');

    // Define the mapping of featured categories to actual product categories
    const mappings = [
      {
        // Update featured category to match actual product category name
        oldName: 'Robotic DIY Kits',
        newName: 'Robotic DIY Kits',
        image_url: '/assets/images/categories/robotic-kits.jpg'
      },
      {
        oldName: 'Ready Running Projects',
        newName: 'Ready Running Projects',
        image_url: '/assets/images/categories/ready-running-projects.jpg'
      },
      {
        oldName: 'Raspberry Pi Boards',
        newName: 'Raspberry',  // Match actual product category
        image_url: '/assets/images/categories/raspberry-pi.jpg'
      },
      {
        oldName: 'Mini Drone Kits (Below 20cms)',
        newName: 'Mini Drone Kits',  // Match actual product category
        image_url: '/assets/images/categories/mini-drone-kits.jpg'
      },
      {
        oldName: 'Drone Transmitter and Receiver',
        newName: 'Drone Transmiter Receiver',  // Match actual spelling in products
        image_url: '/assets/images/categories/drone-transmiter-receiver.jpg'
      },
      {
        oldName: 'Drone Transmiter and Receiver',
        newName: 'Drone Transmiter Receiver',  // Same mapping
        image_url: '/assets/images/categories/drone-transmiter-receiver.jpg',
        delete: true  // Delete this duplicate
      },
      {
        oldName: 'Bonka Batteries',
        newName: 'Bonka',  // Match actual product category
        image_url: '/assets/images/categories/bonka.jpg',
        delete: true  // Delete this as it's duplicate
      },
      {
        oldName: 'Bonka',
        newName: 'Bonka',
        image_url: '/assets/images/categories/bonka.jpg'
      },
      {
        oldName: 'Agriculture Drone Parts',
        newName: 'Agriculture Drone Parts',
        image_url: '/assets/images/categories/agriculture-drone.jpg'
      },
      {
        oldName: 'DIY Kits',
        newName: 'DIY Kits',
        image_url: '/assets/images/categories/diy-kits.jpg'
      }
    ];

    let order = 1;
    for (const mapping of mappings) {
      try {
        if (mapping.delete) {
          // Delete duplicate categories
          await db.query('DELETE FROM categories WHERE LOWER(name) = LOWER($1)', [mapping.oldName]);
          console.log(`✗ Deleted duplicate: ${mapping.oldName}`);
        } else {
          // Check if category exists
          const existing = await db.query(
            'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
            [mapping.oldName]
          );

          if (existing.rows.length > 0) {
            // Update the category
            await db.query(
              `UPDATE categories 
               SET name = $1, image_url = $2, display_order = $3
               WHERE LOWER(name) = LOWER($4)`,
              [mapping.newName, mapping.image_url, order, mapping.oldName]
            );
            console.log(`✓ Updated: ${mapping.oldName} → ${mapping.newName}`);
          } else {
            // Create new category
            await db.query(
              `INSERT INTO categories (name, slug, image_url, display_on_home, display_order)
               VALUES ($1, $2, $3, true, $4)`,
              [
                mapping.newName,
                mapping.newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''),
                mapping.image_url,
                order
              ]
            );
            console.log(`+ Created: ${mapping.newName}`);
          }
          order++;
        }
      } catch (err) {
        console.error(`✗ Error with ${mapping.oldName}:`, err.message);
      }
    }

    console.log('\n✅ Categories fixed\n');

    // Recalculate product counts
    console.log('Recalculating product counts...\n');
    const categories = await db.query('SELECT id, name FROM categories WHERE display_on_home = true');
    
    for (const category of categories.rows) {
      const countResult = await db.query(
        `SELECT COUNT(*) as count FROM products WHERE LOWER(TRIM(category)) = LOWER(TRIM($1))`,
        [category.name]
      );
      const count = parseInt(countResult.rows[0].count);
      
      await db.query(
        'UPDATE categories SET product_count = $1 WHERE id = $2',
        [count, category.id]
      );
      
      console.log(`✓ ${category.name}: ${count} products`);
    }

    console.log('\n✅ Product counts updated');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  fixCategories();
}

module.exports = { fixCategories };
