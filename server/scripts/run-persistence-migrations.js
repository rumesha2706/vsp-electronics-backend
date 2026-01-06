const db = require('../db/index');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    console.log('Running Persistence Migrations...');
    try {
        const sqlPath = path.join(__dirname, '../sql-script/01_persistence_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL:', sqlPath);
        await db.query(sql);
        console.log('✅ Persistence tables created successfully.');
    } catch (error) {
        console.error('❌ Error running migrations:', error);
    } finally {
        // We cannot close the pool here because the app might be running or we might want to keep it open?
        // Usually scripts exit. db/index likely exports a pool which keeps process alive.
        // We should exit manually.
        process.exit(0);
    }
}

runMigrations();
