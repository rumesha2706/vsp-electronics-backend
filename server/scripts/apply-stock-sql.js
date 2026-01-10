const path = require('path');
// Load .env from project root (3 levels up from server/scripts)
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const db = require('../db/index');
const fs = require('fs');

async function run() {
    try {
        const sqlPath = path.join(__dirname, '../../sql-exports/02-fix-stock-counts.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running SQL:', sql);
        await db.query(sql);
        console.log('Successfully applied 01-add-stock-count.sql');
    } catch (err) {
        console.error('Error applying SQL:', err);
    }
}

run();
