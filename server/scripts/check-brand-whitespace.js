const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../db');

const pool = db.pool;

async function checkWhitespace() {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT id, name, brand, LENGTH(brand) as len FROM products WHERE brand ILIKE '%acebott%' LIMIT 5`);
        console.log('Products:', res.rows);

        // Check if any brand has spaces around it
        const spaced = await client.query(`SELECT id, brand FROM products WHERE brand <> TRIM(brand)`);
        console.log('Products with whitespace in brand:', spaced.rows.length);
        if (spaced.rows.length > 0) console.log(spaced.rows[0]);

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkWhitespace();
