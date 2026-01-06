const db = require('../db/index');

async function seedBrandCategories() {
  try {
    console.log('🌱 Seeding brand categories and items...\n');

    // Get all brands from database
    const brandsResult = await db.query('SELECT id, name FROM brands ORDER BY id');
    const brands = brandsResult.rows;

    // Brand categories structure (same for all brands)
    const brandCategoriesData = [
      { name: '3D Printer Parts', slug: '3d-printer-parts', items: [] },
      { name: 'AC Motor', slug: 'ac-motor', items: [] },
      {
        name: 'Accessories',
        slug: 'accessories',
        items: [
          { name: 'Connectors', slug: 'connectors' },
          { name: 'DIP Converters', slug: 'dip-converters' },
          { name: 'IOT', slug: 'iot' },
          { name: 'Keypad', slug: 'keypad' },
          { name: 'Silicone Wires', slug: 'silicone-wires' },
          { name: 'Twezzers', slug: 'twezzers' },
          { name: 'USB Cables', slug: 'usb-cables' },
        ],
      },
      { name: 'Agriculture Drone Parts', slug: 'agriculture-drone-parts', items: [] },
      { name: 'Antenna', slug: 'antenna', items: [] },
      { name: 'Audio Jack', slug: 'audio-jack', items: [] },
      {
        name: 'Battery',
        slug: 'battery',
        items: [{ name: 'Battery Holders', slug: 'battery-holders' }],
      },
    ];

    // Seed brand categories for each brand
    let totalCategories = 0;
    let totalItems = 0;

    for (const brand of brands) {
      console.log(`\n📦 ${brand.name}:`);

      for (let catIndex = 0; catIndex < brandCategoriesData.length; catIndex++) {
        const catData = brandCategoriesData[catIndex];

        const catResult = await db.query(
          `INSERT INTO brand_categories (brand_id, name, slug, display_order)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [brand.id, catData.name, catData.slug, catIndex + 1]
        );

        const categoryId = catResult.rows[0].id;
        totalCategories++;
        console.log(`  ✓ ${catData.name}`);

        // Seed items under this category
        if (catData.items && catData.items.length > 0) {
          for (let itemIndex = 0; itemIndex < catData.items.length; itemIndex++) {
            const itemData = catData.items[itemIndex];

            await db.query(
              `INSERT INTO brand_category_items (brand_category_id, name, slug, display_order)
               VALUES ($1, $2, $3, $4)`,
              [categoryId, itemData.name, itemData.slug, itemIndex + 1]
            );

            totalItems++;
            console.log(`    └─ ${itemData.name}`);
          }
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Brand categories seeding completed!\n`);
    console.log(`Summary:`);
    console.log(`  • Brands: ${brands.length}`);
    console.log(`  • Categories per brand: ${brandCategoriesData.length}`);
    console.log(`  • Total brand categories: ${totalCategories}`);
    console.log(`  • Total category items: ${totalItems}`);
    console.log(`${'='.repeat(60)}\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedBrandCategories();
