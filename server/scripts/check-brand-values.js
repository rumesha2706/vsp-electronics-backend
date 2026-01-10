const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../db');

const pool = db.pool;

async function checkBrands() {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT id, name, brand FROM products WHERE brand ILIKE '%acebott%' LIMIT 10`);
        console.log('Products with brand matching "acebott":', res.rows);

        const countRes = await client.query(`SELECT COUNT(*) FROM products WHERE brand ILIKE '%acebott%'`);
        console.log('Total count:', countRes.rows[0].count);

        const brandsRes = await client.query(`SELECT DISTINCT brand FROM products`);
        console.log('All distinct brands:', brandsRes.rows.map(r => r.brand));

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkBrands();
