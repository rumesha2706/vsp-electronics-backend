const db = require('./index');

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMP,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

async function createTable() {
  await db.query(CREATE_TABLE_SQL);
  console.log('✅ Users table created/verified');
}

async function createUser(userData) {
  const { email, passwordHash, firstName, lastName, phone, company, oauthProvider, oauthId } = userData;

  const sql = `
    INSERT INTO users (email, password_hash, first_name, last_name, phone, company, oauth_provider, oauth_id, is_verified)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, email, first_name, last_name, is_verified, created_at
  `;

  // If OAuth, mark as verified
  const isVerified = !!oauthProvider;

  const res = await db.query(sql, [
    email,
    passwordHash || null,
    firstName || null,
    lastName || null,
    phone || null,
    company || null,
    oauthProvider || null,
    oauthId || null,
    isVerified
  ]);

  return res.rows[0];
}

async function getUserByEmail(email) {
  const res = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return res.rows[0];
}

async function getUserById(id) {
  const res = await db.query(
    'SELECT id, email, first_name, last_name, phone, company, address, city, state, zip_code, country, is_verified, oauth_provider, profile_picture, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return res.rows[0];
}

async function getUserWithPassword(email) {
  const res = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return res.rows[0];
}

async function getUserByPhone(phone) {
  const res = await db.query(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  );
  return res.rows[0];
}

async function updateUser(id, updates) {
  const setClauses = [];
  const params = [];
  let paramIndex = 1;

  if (updates.firstName !== undefined) {
    setClauses.push(`first_name = $${paramIndex++}`);
    params.push(updates.firstName);
  }
  if (updates.lastName !== undefined) {
    setClauses.push(`last_name = $${paramIndex++}`);
    params.push(updates.lastName);
  }
  if (updates.phone !== undefined) {
    setClauses.push(`phone = $${paramIndex++}`);
    params.push(updates.phone);
  }
  if (updates.company !== undefined) {
    setClauses.push(`company = $${paramIndex++}`);
    params.push(updates.company);
  }
  if (updates.address !== undefined) {
    setClauses.push(`address = $${paramIndex++}`);
    params.push(updates.address);
  }
  if (updates.city !== undefined) {
    setClauses.push(`city = $${paramIndex++}`);
    params.push(updates.city);
  }
  if (updates.state !== undefined) {
    setClauses.push(`state = $${paramIndex++}`);
    params.push(updates.state);
  }
  if (updates.zipCode !== undefined) {
    setClauses.push(`zip_code = $${paramIndex++}`);
    params.push(updates.zipCode);
  }
  if (updates.country !== undefined) {
    setClauses.push(`country = $${paramIndex++}`);
    params.push(updates.country);
  }
  if (updates.profilePicture !== undefined) {
    setClauses.push(`profile_picture = $${paramIndex++}`);
    params.push(updates.profilePicture);
  }

  setClauses.push(`updated_at = NOW()`);

  if (setClauses.length === 1) {
    return getUserById(id);
  }

  params.push(id);
  const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, first_name, last_name, is_verified`;

  const res = await db.query(sql, params);
  return res.rows[0];
}

async function setVerificationToken(userId, token, expiresAt) {
  await db.query(
    'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
    [token, expiresAt, userId]
  );
}

async function verifyEmail(token) {
  const now = new Date();

  const res = await db.query(
    `UPDATE users 
     SET is_verified = TRUE, email_verified_at = NOW(), verification_token = NULL, verification_token_expires = NULL
     WHERE verification_token = $1 AND verification_token_expires > $2
     RETURNING id, email, first_name, last_name, is_verified`,
    [token, now]
  );

  return res.rows[0];
}

async function setResetToken(userId, token, expiresAt) {
  await db.query(
    'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
    [token, expiresAt, userId]
  );
}

async function resetPassword(token, passwordHash) {
  const now = new Date();

  const res = await db.query(
    `UPDATE users 
     SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
     WHERE reset_token = $2 AND reset_token_expires > $3
     RETURNING id, email`,
    [passwordHash, token, now]
  );

  return res.rows[0];
}

async function getAllUsers(limit = 100, offset = 0) {
  const res = await db.query(
    `SELECT id, email, first_name, last_name, is_verified, oauth_provider, created_at 
     FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return res.rows;
}

module.exports = {
  createTable,
  createUser,
  getUserByEmail,
  getUserById,
  getUserWithPassword,
  updateUser,
  setVerificationToken,
  verifyEmail,
  setResetToken,
  resetPassword,
  getUserByPhone,
  getAllUsers
};
