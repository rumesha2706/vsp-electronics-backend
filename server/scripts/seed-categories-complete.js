/**
 * Seed Categories Database with Complete Structure
 * Home Screen Categories, All Categories, Subcategories, and Brands
 */

require('dotenv').config();
const categoriesModel = require('../db/categories-model');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding categories database with complete structure...\n');

    // ============================================
    // HOME SCREEN CATEGORIES (display_on_home = true)
    // ============================================

    console.log('📍 HOME SCREEN CATEGORIES:');

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

    console.log('📑 ALL-CATEGORIES:');

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

    const allCatsArray = [...homeCategories, ...allCategories];
    const createdCategories = [];

    for (const cat of allCatsArray) {
      const created = await categoriesModel.createCategory(
        cat.name,
        cat.slug,
        cat.description,
        null,
        cat.displayOnHome,
        cat.displayOrder
      );
      createdCategories.push(created);
      const homeFlag = created.display_on_home ? ' 🏠 (HOME)' : '';
      console.log(`  ✓ ${created.name}${homeFlag}`);
    }

    // ============================================
    // CREATE SUBCATEGORIES
    // ============================================

    console.log('\n📚 SUBCATEGORIES:');

    // Find references
    const raspberryCategory = createdCategories.find(c => c.slug === 'raspberry');
    const diyKitsCategory = createdCategories.find(c => c.slug === 'diy-kits');

    // Raspberry Pi → RPI Accessories
    if (raspberryCategory) {
      await categoriesModel.createSubcategory(
        raspberryCategory.id,
        'RPI Accessories',
        'rpi-accessories',
        'Accessories for Raspberry Pi',
        null,
        1
      );
      console.log(`  ✓ Raspberry Pi Boards`);
      console.log(`    └─ RPI Accessories`);
    }

    // DIY Kits → Multiple subcategories
    if (diyKitsCategory) {
      const diySubcategories = [
        { name: 'AM Robotics', slug: 'am-robotics' },
        { name: 'Ace Bott Kits', slug: 'ace-bott-kits' },
        { name: 'JSB DIY Kits', slug: 'jsb-diy-kits' },
        { name: 'Robotic DIY Kits', slug: 'robotic-diy-kits-sub' },
        { name: 'DB OLO Kits', slug: 'dbolo-kits' },
        { name: 'Mini Drone Kits Below 20cms', slug: 'mini-drone-kits-below-20cms-sub' }
      ];

      console.log(`  ✓ DIY Kits`);
      for (const subcat of diySubcategories) {
        await categoriesModel.createSubcategory(
          diyKitsCategory.id,
          subcat.name,
          subcat.slug,
          null,
          null,
          0
        );
        console.log(`    └─ ${subcat.name}`);
      }
    }

    // ============================================
    // CREATE BRANDS (14 total)
    // ============================================

    console.log('\n🏷️  BRANDS (14):');

    const brands = [
      { name: 'ACEBOTT', slug: 'acebott' },
      { name: 'Amass', slug: 'amass' },
      { name: 'Arduino', slug: 'arduino' },
      { name: 'BONKA', slug: 'bonka' },
      { name: 'EFT', slug: 'eft' },
      { name: 'Elcon', slug: 'elcon' },
      { name: 'EMAX', slug: 'emax' },
      { name: 'Hobbywing', slug: 'hobbywing' },
      { name: 'JIYI', slug: 'jiyi' },
      { name: 'Mastech', slug: 'mastech' },
      { name: 'Raspberry Pi', slug: 'raspberry-pi' },
      { name: 'SKYDROID', slug: 'skydroid' },
      { name: 'SKYRC', slug: 'skyrc' },
      { name: 'TATTU', slug: 'tattu' }
    ];

    for (const brand of brands) {
      await categoriesModel.createBrand(
        brand.name,
        brand.slug,
        null,
        null,
        null,
        null
      );
      console.log(`  ✓ ${brand.name}`);
    }

    // ============================================
    // CATEGORY ROUTES
    // ============================================

    console.log('\n🔗 CATEGORY ROUTES:');

    // Home routes
    for (const cat of homeCategories) {
      const catObj = createdCategories.find(c => c.slug === cat.slug);
      if (catObj) {
        await categoriesModel.createCategoryRoute(
          catObj.id,
          '/',
          'home',
          null
        );
      }
    }
    console.log(`  ✓ Home categories → /`);

    // All categories routes
    for (const cat of allCategories) {
      const catObj = createdCategories.find(c => c.slug === cat.slug);
      if (catObj) {
        await categoriesModel.createCategoryRoute(
          catObj.id,
          '/all-categories',
          'category',
          null
        );
      }
    }
    console.log(`  ✓ All categories → /all-categories`);

    // ============================================
    // SUMMARY
    // ============================================

    console.log('\n✅ DATABASE SEEDING COMPLETED!\n');
    console.log('📊 SUMMARY:');
    console.log(`   • Home Categories: ${homeCategories.length}`);
    console.log(`   • All Categories: ${allCategories.length}`);
    console.log(`   • Total Categories: ${createdCategories.length}`);
    console.log(`   • Subcategories: 7 (1 under Raspberry Pi + 6 under DIY Kits)`);
    console.log(`   • Brands: ${brands.length}`);
    console.log('\n🎯 API ENDPOINTS:');
    console.log(`   • GET /api/categories?homeOnly=true        → Home categories`);
    console.log(`   • GET /api/categories                      → All categories`);
    console.log(`   • GET /api/categories/:id                  → Category with subcats & brands`);
    console.log(`   • GET /api/categories/:id/subcategories    → Subcategories list`);
    console.log(`   • GET /api/categories/admin/brands         → All brands list`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
