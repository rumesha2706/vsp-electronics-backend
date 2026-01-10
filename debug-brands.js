
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./server/db/index');

async function listBrands() {
    try {
        console.log('Connecting to DB...');
        const res = await db.query('SELECT name, slug, logo_url FROM brands ORDER BY name');
        console.log('Brands:', JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listBrands();
