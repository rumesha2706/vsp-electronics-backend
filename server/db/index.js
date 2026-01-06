const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL env var (recommended) or build from parts
const connectionString = process.env.DATABASE_URL || process.env.PG_CONN || '';

if (!connectionString) {
  console.warn('⚠ No DATABASE_URL found in environment; DB operations will fail until set.');
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query
};
