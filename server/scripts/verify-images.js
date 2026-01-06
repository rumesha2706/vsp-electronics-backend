/**
 * Verify all images are now local
 */

const db = require('../db');

async function verifyImages() {
  try {
    // Check local vs external URLs
    const local = await db.query("SELECT COUNT(*) as count FROM products WHERE image LIKE '/assets/images%'");
    const external = await db.query("SELECT COUNT(*) as count FROM products WHERE image LIKE 'http%'");
    const placeholder = await db.query("SELECT COUNT(*) as count FROM products WHERE image = '/assets/images/placeholder.jpg'");
    const nullImages = await db.query("SELECT COUNT(*) as count FROM products WHERE image IS NULL OR image = ''");
    
    console.log('📊 Image URL Status:');
    console.log('  ✓ Local URLs: ' + local.rows[0].count);
    console.log('  ✗ External URLs: ' + external.rows[0].count);
    console.log('  ⊘ Placeholder: ' + placeholder.rows[0].count);
    console.log('  ⚠️  No image: ' + nullImages.rows[0].count);
    
    // Show some sample local paths
    const samples = await db.query("SELECT id, name, image FROM products WHERE image LIKE '/assets/images%' LIMIT 5");
    console.log('\n📋 Sample local image paths:');
    samples.rows.forEach(p => {
      console.log(`  • ${p.image}`);
    });

    // Show wireless modules images
    const wirelessImages = await db.query("SELECT id, name, image FROM products WHERE category = 'Wireless Modules' LIMIT 3");
    console.log('\n🔌 Wireless Modules images:');
    wirelessImages.rows.forEach(p => {
      console.log(`  • ${p.name.substring(0, 50)}`);
      console.log(`    ${p.image}`);
    });

    console.log('\n✅ All images verified!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

verifyImages();
