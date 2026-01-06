/**
 * Backup Product Data Export Script
 * Exports all product data from old TypeScript files to JSON for backup/archival
 * Run before removing data files: node scripts/backup-product-data.js
 */

const fs = require('fs');
const path = require('path');

async function backupProductData() {
  try {
    console.log('🔄 Starting product data backup...\n');

    // Data file paths (from old src/app/data/ directory)
    const dataFiles = [
      '3d-printers-parts-data.ts',
      '3d-printers-parts-real-data.ts',
      'ac-motor-data.ts',
      'accessories-connectors-data.ts',
      'accessories-data.ts',
      'antenna-data.ts',
      'audio-jack-data.ts',
      'battery-data.ts',
      'bms-data.ts',
      'drone-transmiter-receiver-data.ts',
      'rpi-accessories-data.ts',
      'shield-accessories-data.ts',
      'wheels-data.ts',
      'wireless-modules.ts',
      'category-import-config.ts'
    ];

    const backupDir = path.join(__dirname, '../.backup');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `product-data-backup-${timestamp}`);

    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    let totalProducts = 0;
    const backupSummary = {
      timestamp: new Date().toISOString(),
      backupPath: backupPath,
      filesBackedUp: [],
      totalProducts: 0,
      categories: {}
    };

    // Copy each data file to backup
    const srcDataDir = path.join(__dirname, '../src/app/data');
    for (const file of dataFiles) {
      const srcFile = path.join(srcDataDir, file);
      const backupFile = path.join(backupPath, file);

      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, backupFile);
        
        // Read and parse to count products
        const content = fs.readFileSync(srcFile, 'utf-8');
        const categoryMatch = file.replace('-data.ts', '').replace(/-/g, ' ');
        
        // Count products (approximate by counting {id: ' patterns)
        const productCount = (content.match(/id:\s*'/g) || []).length;
        totalProducts += productCount;
        
        backupSummary.filesBackedUp.push({
          file: file,
          size: fs.statSync(srcFile).size,
          productCount: productCount
        });

        if (productCount > 0) {
          backupSummary.categories[categoryMatch] = productCount;
        }

        console.log(`✓ Backed up: ${file} (${productCount} products)`);
      } else {
        console.log(`⚠ File not found: ${file}`);
      }
    }

    // Create backup summary
    backupSummary.totalProducts = totalProducts;
    const summaryFile = path.join(backupPath, 'BACKUP_SUMMARY.json');
    fs.writeFileSync(summaryFile, JSON.stringify(backupSummary, null, 2));

    console.log('\n✅ Backup completed successfully!');
    console.log(`📁 Backup location: ${backupPath}`);
    console.log(`📊 Total products backed up: ${totalProducts}`);
    console.log(`📄 Files backed up: ${backupSummary.filesBackedUp.length}`);
    console.log(`📋 Summary saved to: BACKUP_SUMMARY.json`);

    // Create a master backup index
    const backupIndex = path.join(backupDir, 'BACKUPS_INDEX.json');
    let indexData = [];
    
    if (fs.existsSync(backupIndex)) {
      indexData = JSON.parse(fs.readFileSync(backupIndex, 'utf-8'));
    }
    
    indexData.push({
      timestamp: new Date().toISOString(),
      backupFolder: path.basename(backupPath),
      totalProducts: totalProducts,
      filesCount: backupSummary.filesBackedUp.length
    });
    
    fs.writeFileSync(backupIndex, JSON.stringify(indexData, null, 2));

    console.log('\n🔐 Next steps:');
    console.log('1. Review the backup in: ' + backupPath);
    console.log('2. Run: node server/scripts/migrate-static-data.js (to create database)');
    console.log('3. Run: node scripts/import-products-to-db.js (to import to database)');
    console.log('4. Remove old data files: rm -rf src/app/data/*.ts');
    console.log('5. Update components to use ProductDataService');

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run the backup
backupProductData();
