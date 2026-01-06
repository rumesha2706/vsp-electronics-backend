/**
 * Populate Category Images and Display Settings
 * This script updates categories with images and display_on_home settings
 */

const db = require('../db');

async function populateCategoryImages() {
  try {
    console.log('Populating category images and settings...\n');

    // Category images and settings
    const categoryUpdates = [
      {
        name: 'Robotic DIY Kits',
        image_url: '/assets/images/categories/robotic-kits.jpg',
        display_on_home: true,
        display_order: 1
      },
      {
        name: 'Ready Running Projects',
        image_url: '/assets/images/categories/ready-running-projects.jpg',
        display_on_home: true,
        display_order: 2
      },
      {
        name: 'Raspberry',
        image_url: '/assets/images/categories/raspberry-pi.jpg',
        display_on_home: true,
        display_order: 3
      },
      {
        name: 'Mini Drone Kits (Below 20cms)',
        image_url: '/assets/images/categories/mini-drone-kits.jpg',
        display_on_home: true,
        display_order: 4
      },
      {
        name: 'Drone Transmiter and Receiver',
        image_url: '/assets/images/categories/drone-transmiter-receiver.jpg',
        display_on_home: true,
        display_order: 5
      },
      {
        name: 'Bonka',
        image_url: '/assets/images/categories/bonka.jpg',
        display_on_home: true,
        display_order: 6
      },
      {
        name: 'Agriculture Drone Parts',
        image_url: '/assets/images/categories/agriculture-drone.jpg',
        display_on_home: true,
        display_order: 7
      },
      {
        name: 'DIY Kits',
        image_url: '/assets/images/categories/diy-kits.jpg',
        display_on_home: true,
        display_order: 8
      }
    ];

    for (const update of categoryUpdates) {
      try {
        // Check if category exists
        const existing = await db.query(
          'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
          [update.name]
        );

        if (existing.rows.length > 0) {
          // Update existing category
          await db.query(
            `UPDATE categories 
             SET image_url = $1, display_on_home = $2, display_order = $3
             WHERE LOWER(name) = LOWER($4)`,
            [update.image_url, update.display_on_home, update.display_order, update.name]
          );
          console.log(`✓ Updated: ${update.name}`);
        } else {
          // Create new category if it doesn't exist
          await db.query(
            `INSERT INTO categories (name, slug, image_url, display_on_home, display_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              update.name,
              update.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''),
              update.image_url,
              update.display_on_home,
              update.display_order
            ]
          );
          console.log(`+ Created: ${update.name}`);
        }
      } catch (err) {
        console.error(`✗ Error updating ${update.name}:`, err.message);
      }
    }

    console.log('\n✅ Category images and settings populated successfully');

    // Show summary
    console.log('\n📊 Category Summary:');
    const result = await db.query(`
      SELECT 
        name, 
        slug, 
        image_url, 
        display_on_home, 
        display_order,
        COUNT(DISTINCT p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON LOWER(TRIM(p.category)) LIKE '%' || LOWER(TRIM(c.name)) || '%'
      GROUP BY c.id, c.name, c.slug, c.image_url, c.display_on_home, c.display_order
      ORDER BY display_order ASC
    `);

    console.log('\nDisplayed on Home Page:');
    result.rows
      .filter(cat => cat.display_on_home)
      .forEach((cat, idx) => {
        console.log(`${idx + 1}. ${cat.name}`);
        console.log(`   Image: ${cat.image_url}`);
        console.log(`   Products: ${cat.product_count}`);
      });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  populateCategoryImages();
}

module.exports = { populateCategoryImages };
