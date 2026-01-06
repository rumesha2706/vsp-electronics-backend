/**
 * Content Database Migration
 * Creates content table for storing documentation and static content
 * This allows deleting markdown files and storing everything in database
 * 
 * Run: node server/scripts/migrate-content-db.js
 */

const db = require('./db/index');
const fs = require('fs');
const path = require('path');

async function migrateContentDatabase() {
  try {
    console.log('📝 Creating content table...\n');

    // Create content table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        description TEXT,
        meta_keywords VARCHAR(500),
        version VARCHAR(20) DEFAULT '1.0',
        position INT DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        author VARCHAR(100) DEFAULT 'system',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
      CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);
      CREATE INDEX IF NOT EXISTS idx_content_published ON content(is_published);
      
      -- Full text search index
      CREATE INDEX IF NOT EXISTS idx_content_fts ON content 
        USING GIN(to_tsvector('english', title || ' ' || content));
    `;

    await db.query(createTableQuery);
    console.log('✓ Content table created\n');

    // Read markdown files and insert into database
    console.log('📂 Reading markdown files...\n');

    const mdFiles = [
      { file: 'README.md', slug: 'readme', category: 'documentation' },
      { file: 'SETUP.md', slug: 'setup', category: 'guide' },
      { file: 'START_HERE.md', slug: 'start-here', category: 'guide' },
      { file: 'SECURITY_GUIDE.md', slug: 'security-guide', category: 'documentation' },
      { file: 'DATA_MIGRATION_SECURITY_GUIDE.md', slug: 'data-migration-guide', category: 'guide' },
      { file: 'WORKSPACE_SECURITY_AUDIT_REPORT.md', slug: 'security-audit-report', category: 'report' },
      { file: 'QUICK_REFERENCE_MIGRATION.md', slug: 'quick-reference', category: 'guide' },
      { file: 'PROJECT_AUDIT_INDEX.md', slug: 'project-index', category: 'documentation' },
      { file: 'AUDIT_EXECUTIVE_SUMMARY.md', slug: 'audit-summary', category: 'report' },
      { file: 'DOCUMENTATION_INDEX.md', slug: 'documentation-index', category: 'index' },
      { file: 'DOCUMENTATION_INDEX_AUDIT.md', slug: 'documentation-index-audit', category: 'index' }
    ];

    let importedCount = 0;

    for (const fileInfo of mdFiles) {
      const filePath = path.join(__dirname, '../', fileInfo.file);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${fileInfo.file}`);
        continue;
      }

      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Extract title from first heading
        const titleMatch = fileContent.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : fileInfo.file;
        
        // Extract description from first paragraph
        const descMatch = fileContent.match(/^#+\s+.+\n\n(.+?)(?:\n\n|$)/);
        const description = descMatch ? descMatch[1].trim().substring(0, 200) : '';

        // Extract metadata keywords
        const keywordsMatch = fileContent.match(/keywords?:\s*(.+)/i);
        const metaKeywords = keywordsMatch ? keywordsMatch[1].trim() : null;

        // Insert content
        const query = `
          INSERT INTO content (title, slug, category, content, description, meta_keywords, author, position)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (slug) DO UPDATE SET 
            title = $1,
            category = $3,
            content = $4,
            description = $5,
            meta_keywords = $6,
            updated_at = NOW()
          RETURNING id, slug
        `;

        const result = await db.query(query, [
          title,
          fileInfo.slug,
          fileInfo.category,
          fileContent,
          description,
          metaKeywords,
          'system',
          importedCount
        ]);

        console.log(`✓ Imported: ${fileInfo.file} → ${result.rows[0].slug}`);
        importedCount++;

      } catch (fileError) {
        console.error(`❌ Error importing ${fileInfo.file}:`, fileError.message);
      }
    }

    console.log(`\n✅ Content migration completed!`);
    console.log(`📊 Files imported: ${importedCount}`);
    console.log(`📝 Total records in content table: ${importedCount}`);

    console.log('\n📋 Next steps:');
    console.log('1. Add content router to server/routes/index.js:');
    console.log('   const contentApiRouter = require(\'./content-api-router\');');
    console.log('   app.use(\'/api/content\', contentApiRouter);');
    console.log('2. Test API endpoints:');
    console.log('   GET /api/content/readme');
    console.log('   GET /api/content/category/guide');
    console.log('   GET /api/content?page=1&limit=10');
    console.log('3. Verify content loads in frontend');
    console.log('4. Delete markdown files:');
    console.log('   rm *.md (keeping only this script for reference)');

    await db.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateContentDatabase();
