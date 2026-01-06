/**
 * Seed Categories Database with Initial Data
 * Creates categories, subcategories, and brands from your existing data
 */

require('dotenv').config();
const categoriesModel = require('../db/categories-model');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding categories database...\n');

    // ============================================
    // HOME SCREEN CATEGORIES (display_on_home = true)
    // ============================================

    const homeCategories = [
      {
        name: 'Robotic DIY Kits',
        slug: 'robotic-diy-kits',
        description: 'Complete DIY Robotic Kit Collections',
        displayOnHome: true,
        displayOrder: 1
      },
      {
        name: 'Ready Running Projects',
        slug: 'ready-running-projects',
        description: 'Ready to use project kits',
        displayOnHome: true,
        displayOrder: 2
      },
      {
        name: 'Raspberry Pi Boards',
        slug: 'raspberry',
        description: 'Raspberry Pi single board computers',
        displayOnHome: true,
        displayOrder: 3
      },
      {
        name: 'Mini Drone Kits (Below 20cms)',
        slug: 'mini-drone-kits-below-20cms',
        description: 'Compact drone kits under 20cm',
        displayOnHome: true,
        displayOrder: 4
      },
      {
        name: 'Drone Transmitter and Receiver',
        slug: 'drone-transmitter-receiver',
        description: 'RC transmitter and receiver modules',
        displayOnHome: true,
        displayOrder: 5
      },
      {
        name: 'Bonka Batteries',
        slug: 'bonka-batteries',
        description: 'BONKA brand battery products',
        displayOnHome: true,
        displayOrder: 6
      },
      {
        name: 'Agriculture Drone Parts',
        slug: 'agriculture-drone-parts',
        description: 'Parts for agricultural drones',
        displayOnHome: true,
        displayOrder: 7
      },
      {
        name: 'DIY Kits',
        slug: 'diy-kits',
        description: 'Various DIY kit collections',
        displayOnHome: true,
        displayOrder: 8
      }
    ];

    // ============================================
    // ALL-CATEGORIES (display_on_home = false)
    // ============================================

    const allCategories = [
      {
        name: 'BMS',
        slug: 'bms',
        description: 'Battery Management Systems',
        displayOnHome: false,
        displayOrder: 9
      },
      {
        name: 'Shield Accessories',
        slug: 'shield-accessories',
        description: 'Arduino and Raspberry Pi Shield Accessories',
        displayOnHome: false,
        displayOrder: 10
      },
      {
        name: 'Wheels',
        slug: 'wheels',
        description: 'Robot and Vehicle Wheels',
        displayOnHome: false,
        displayOrder: 11
      },
      {
        name: 'Wireless Modules',
        slug: 'wireless-modules',
        description: 'WiFi, Bluetooth, and RF Wireless Modules',
        displayOnHome: false,
        displayOrder: 12
      }
    ];

    const categories = [...homeCategories, ...allCategories];

    const createdCategories = [];
    for (const cat of categories) {
      const created = await categoriesModel.createCategory(
        cat.name,
        cat.slug,
        cat.description,
        null,
        cat.displayOnHome,
        cat.displayOrder
      );
      createdCategories.push(created);
      console.log(`✓ Created category: ${created.name}`);
    }

    // ============================================
    // Create Subcategories
    // ============================================

    const bmsCategory = createdCategories[0]; // BMS
    const shieldCategory = createdCategories[1]; // Shield Accessories
    const roboticCategory = createdCategories[4]; // Robotic DIY Kits

    // BMS Subcategories
    const bmsSubs = [
      { categoryId: bmsCategory.id, name: 'Lithium BMS', slug: 'lithium-bms' },
      { categoryId: bmsCategory.id, name: 'Lead Acid BMS', slug: 'lead-acid-bms' }
    ];

    for (const sub of bmsSubs) {
      const created = await categoriesModel.createSubcategory(
        sub.categoryId,
        sub.name,
        sub.slug,
        null,
        null,
        0
      );
      console.log(`  └─ Subcategory: ${created.name}`);
    }

    // Shield Accessories Subcategories
    const shieldSubs = [
      { categoryId: shieldCategory.id, name: 'Sensor Shields', slug: 'sensor-shields' },
      { categoryId: shieldCategory.id, name: 'Communication Shields', slug: 'communication-shields' },
      { categoryId: shieldCategory.id, name: 'Motor Shields', slug: 'motor-shields' }
    ];

    for (const sub of shieldSubs) {
      const created = await categoriesModel.createSubcategory(
        sub.categoryId,
        sub.name,
        sub.slug,
        null,
        null,
        0
      );
      console.log(`  └─ Subcategory: ${created.name}`);
    }

    // Robotic DIY Kits Subcategories
    const roboticSubs = [
      { categoryId: roboticCategory.id, name: 'Beginner Kits', slug: 'beginner-kits' },
      { categoryId: roboticCategory.id, name: 'Intermediate Kits', slug: 'intermediate-kits' },
      { categoryId: roboticCategory.id, name: 'Advanced Kits', slug: 'advanced-kits' }
    ];

    for (const sub of roboticSubs) {
      const created = await categoriesModel.createSubcategory(
        sub.categoryId,
        sub.name,
        sub.slug,
        null,
        null,
        0
      );
      console.log(`  └─ Subcategory: ${created.name}`);
    }

    // ============================================
    // Create Brands
    // ============================================

    const brands = [
      // BMS Brands
      { name: 'JBL', slug: 'jbl', categoryId: bmsCategory.id },
      { name: 'Orion', slug: 'orion', categoryId: bmsCategory.id },
      { name: 'Thunder Power', slug: 'thunder-power', categoryId: bmsCategory.id },
      { name: 'Tattu', slug: 'tattu', categoryId: bmsCategory.id },

      // Shield Accessories Brands
      { name: 'Arduino', slug: 'arduino', categoryId: shieldCategory.id },
      { name: 'Elegoo', slug: 'elegoo', categoryId: shieldCategory.id },

      // Robotic DIY Brands
      { name: 'ACEBOT', slug: 'acebot', categoryId: roboticCategory.id },
      { name: 'AM Robotics', slug: 'am-robotics', categoryId: roboticCategory.id },
      { name: 'ReadyToSky', slug: 'readytosky', categoryId: roboticCategory.id },
      { name: 'Skyrc', slug: 'skyrc', categoryId: roboticCategory.id },

      // General Brands
      { name: 'DJI', slug: 'dji', categoryId: null },
      { name: 'Raspberry Pi', slug: 'raspberry-pi', categoryId: null }
    ];

    console.log('\n✓ Creating Brands:');
    for (const brand of brands) {
      const created = await categoriesModel.createBrand(
        brand.name,
        brand.slug,
        brand.categoryId,
        null,
        null,
        null
      );
      console.log(`✓ Created brand: ${created.name}`);
    }

    // ============================================
    // Create Category Routes
    // ============================================

    console.log('\n✓ Creating Category Routes:');

    const routes = [
      { categoryId: bmsCategory.id, routeUrl: '/all-categories', routeType: 'category' },
      { categoryId: shieldCategory.id, routeUrl: '/all-categories', routeType: 'category' },
      { categoryId: createdCategories[2].id, routeUrl: '/all-categories', routeType: 'category' },
      { categoryId: createdCategories[3].id, routeUrl: '/all-categories', routeType: 'category' },
      { categoryId: roboticCategory.id, routeUrl: '/', routeType: 'home' }
    ];

    for (const route of routes) {
      await categoriesModel.createCategoryRoute(
        route.categoryId,
        route.routeUrl,
        route.routeType,
        null
      );
      console.log(`✓ Created route for category ID: ${route.categoryId} → ${route.routeUrl}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Categories: ${createdCategories.length}`);
    console.log(`   • Subcategories: ${bmsSubs.length + shieldSubs.length + roboticSubs.length}`);
    console.log(`   • Brands: ${brands.length}`);
    console.log(`   • Routes: ${routes.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
