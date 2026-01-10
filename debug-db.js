require('dotenv').config();
const { Pool } = require('pg');

console.log('--- Debugging DB Connection ---');
console.log('Current Directory:', process.cwd());
console.log('DATABASE_URL starts with:', (process.env.DATABASE_URL || '').substring(0, 15) + '...');
console.log('PG_CONN starts with:', (process.env.PG_CONN || '').substring(0, 15) + '...');

const connectionString = process.env.DATABASE_URL || process.env.PG_CONN;

if (!connectionString) {
    console.error('❌ ERROR: No connection string found!');
    process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

(async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to DB!');
        const res = await client.query('SELECT NOW()');
        console.log('DB Time:', res.rows[0].now);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Error:', err);
        process.exit(1);
    }
})();
