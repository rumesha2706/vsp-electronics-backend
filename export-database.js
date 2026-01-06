const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Create SQL export directory
const sqlDir = path.join(__dirname, 'sql-exports');
if (!fs.existsSync(sqlDir)) {
  fs.mkdirSync(sqlDir, { recursive: true });
}

// Load environment variables
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function exportDatabase() {
  try {
    await client.connect();
    console.log('✓ Connected to database');

    // 1. Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log(`\n✓ Found ${tables.length} tables:`);
    tables.forEach(t => console.log(`  - ${t}`));

    let schemaSQL = '';
    let dataSQL = '';
    let proceduresSQL = '';

    // 2. Export DDL for each table
    console.log('\n📝 Exporting table schemas...');
    
    for (const table of tables) {
      try {
        // Get table DDL
        const ddlQuery = `
          SELECT 
            'CREATE TABLE IF NOT EXISTS ' || t.tablename || ' (' || E'\n' ||
            string_agg(
              '  ' || a.attname || ' ' ||
              pg_catalog.format_type(a.atttypid, a.atttypmod) ||
              CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END ||
              CASE 
                WHEN (SELECT d.adsrc FROM pg_attrdef d WHERE d.adrelid = t.oid AND d.adnum = a.attnum) IS NOT NULL 
                THEN ' DEFAULT ' || (SELECT d.adsrc FROM pg_attrdef d WHERE d.adrelid = t.oid AND d.adnum = a.attnum)
                ELSE '' 
              END,
              ',' || E'\n' 
              ORDER BY a.attnum
            ) || E'\n' ||
            COALESCE('  PRIMARY KEY (' || array_to_string(ARRAY(
              SELECT a.attname FROM pg_attribute a 
              WHERE a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
            ), ', ') || ')', '') ||
            E'\n);' as ddl
          FROM pg_class t
          JOIN pg_attribute a ON a.attrelid = t.oid
          JOIN pg_index ix ON ix.indrelid = t.oid AND ix.indisprimary
          WHERE t.relname = $1
          GROUP BY t.tablename, t.oid, ix.indkey;
        `;

        const ddlResult = await client.query(
          `SELECT pg_get_create_table_as_select('${table}'::regclass)`,
          []
        ).catch(() => null);

        // Alternative: Get CREATE TABLE statement
        const altQuery = `
          SELECT 
            'CREATE TABLE ' || schemaname || '.' || tablename || ' AS' || E'\n' ||
            pg_get_tabledef(to_regclass(schemaname || '.' || tablename)) as def
          FROM pg_tables
          WHERE tablename = $1 AND schemaname = 'public'
        `;

        // Use a simpler approach: pg_dump style
        const simpleQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position
        `;

        const columnsResult = await client.query(simpleQuery, [table]);
        
        if (columnsResult.rows.length > 0) {
          schemaSQL += `-- Table: ${table}\n`;
          schemaSQL += `DROP TABLE IF EXISTS "${table}" CASCADE;\n`;
          schemaSQL += `CREATE TABLE "${table}" (\n`;
          
          const columnDefs = columnsResult.rows.map((col, idx) => {
            let def = `  "${col.column_name}" ${col.data_type}`;
            if (col.is_nullable === 'NO') def += ' NOT NULL';
            if (col.column_default) def += ` DEFAULT ${col.column_default}`;
            return def;
          });
          
          schemaSQL += columnDefs.join(',\n');
          
          // Get primary key
          const pkQuery = `
            SELECT a.attname
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelname = $1
          `;
          
          const pkResult = await client.query(pkQuery, [`${table}_pkey`]).catch(() => null);
          
          if (pkResult && pkResult.rows.length > 0) {
            const pkCols = pkResult.rows.map(r => `"${r.attname}"`).join(', ');
            schemaSQL += `,\n  PRIMARY KEY (${pkCols})`;
          }
          
          schemaSQL += '\n);\n\n';
        }
      } catch (err) {
        console.error(`  ✗ Error getting DDL for ${table}: ${err.message}`);
      }
    }

    // 3. Export data for each table
    console.log('📊 Exporting table data...');
    
    for (const table of tables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        const rowCount = countResult.rows[0].count;
        
        if (rowCount > 0) {
          const dataResult = await client.query(`SELECT * FROM "${table}"`);
          
          if (dataResult.rows.length > 0) {
            dataSQL += `\n-- Data for table: ${table} (${rowCount} rows)\n`;
            
            const columns = Object.keys(dataResult.rows[0]);
            const columnNames = columns.map(c => `"${c}"`).join(', ');
            
            dataResult.rows.forEach(row => {
              const values = columns.map(col => {
                const val = row[col];
                if (val === null) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                if (typeof val === 'boolean') return val ? 'true' : 'false';
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                return val;
              }).join(', ');
              
              dataSQL += `INSERT INTO "${table}" (${columnNames}) VALUES (${values});\n`;
            });
          }
        }
        console.log(`  ✓ Exported ${rowCount} rows from ${table}`);
      } catch (err) {
        console.error(`  ✗ Error exporting data from ${table}: ${err.message}`);
      }
    }

    // 4. Get stored procedures
    console.log('\n🔧 Exporting stored procedures...');
    
    const procQuery = `
      SELECT 
        p.proname,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      ORDER BY p.proname
    `;

    try {
      const procResult = await client.query(procQuery);
      
      if (procResult.rows.length > 0) {
        proceduresSQL = '-- =============================================\n';
        proceduresSQL += '-- STORED PROCEDURES\n';
        proceduresSQL += '-- =============================================\n\n';
        
        procResult.rows.forEach(proc => {
          proceduresSQL += `-- Procedure: ${proc.proname}\n`;
          proceduresSQL += proc.definition + '\n\n';
        });
        
        console.log(`  ✓ Found ${procResult.rows.length} procedures`);
      } else {
        console.log('  ℹ No procedures found');
      }
    } catch (err) {
      console.log('  ℹ Could not retrieve procedures');
    }

    // 5. Write to files
    console.log('\n💾 Writing SQL files...\n');
    
    const masterFile = path.join(sqlDir, '00-master-backup.sql');
    let masterContent = '-- VSP ELECTRONICS DATABASE BACKUP\n';
    masterContent += `-- Generated: ${new Date().toISOString()}\n`;
    masterContent += '-- Database: vsp_electronics\n\n';
    masterContent += '-- =============================================\n';
    masterContent += '-- TABLE DEFINITIONS\n';
    masterContent += '-- =============================================\n\n';
    masterContent += schemaSQL;
    masterContent += '\n-- =============================================\n';
    masterContent += '-- TABLE DATA\n';
    masterContent += '-- =============================================\n';
    masterContent += dataSQL;
    
    if (proceduresSQL) {
      masterContent += '\n' + proceduresSQL;
    }
    
    fs.writeFileSync(masterFile, masterContent);
    console.log(`✓ Created: ${path.relative(process.cwd(), masterFile)}`);

    // Write schema separately
    const schemaFile = path.join(sqlDir, '01-schema-ddl.sql');
    fs.writeFileSync(schemaFile, schemaSQL);
    console.log(`✓ Created: ${path.relative(process.cwd(), schemaFile)}`);

    // Write data separately
    const dataFile = path.join(sqlDir, '02-data-inserts.sql');
    fs.writeFileSync(dataFile, dataSQL);
    console.log(`✓ Created: ${path.relative(process.cwd(), dataFile)}`);

    // Write procedures separately
    if (proceduresSQL) {
      const procFile = path.join(sqlDir, '03-procedures.sql');
      fs.writeFileSync(procFile, proceduresSQL);
      console.log(`✓ Created: ${path.relative(process.cwd(), procFile)}`);
    }

    // Create individual table files
    console.log('\n📁 Creating individual table files...');
    for (const table of tables) {
      const tableFile = path.join(sqlDir, `table-${table}.sql`);
      let tableContent = `-- Table: ${table}\n`;
      tableContent += `-- Generated: ${new Date().toISOString()}\n\n`;
      
      // Add schema
      const tableSchemaMatch = schemaSQL.split(`-- Table: ${table}`)[1]?.split(`-- Table:`)[0] || '';
      tableContent += tableSchemaMatch;
      
      // Add data
      const tableDataMatch = dataSQL.split(`-- Data for table: ${table}`)[1]?.split(`-- Data for table:`)[0] || '';
      tableContent += tableDataMatch;
      
      if (tableSchemaMatch || tableDataMatch) {
        fs.writeFileSync(tableFile, tableContent);
        console.log(`  ✓ ${table}.sql`);
      }
    }

    console.log('\n✅ Database export complete!');
    console.log(`\n📂 All files saved to: ${path.relative(process.cwd(), sqlDir)}`);
    console.log('\nFiles created:');
    console.log('  - 00-master-backup.sql (Complete database backup)');
    console.log('  - 01-schema-ddl.sql (Table definitions)');
    console.log('  - 02-data-inserts.sql (All data)');
    if (proceduresSQL) console.log('  - 03-procedures.sql (Stored procedures)');
    console.log('  - table-[name].sql (Individual table files)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

exportDatabase();
