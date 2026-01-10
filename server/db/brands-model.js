const db = require('./index');

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
`;

async function createTable() {
  try {
    await db.query(CREATE_TABLE_SQL);

    // Ensure all columns exist (for existing tables)
    await db.query(`ALTER TABLE brands ADD COLUMN IF NOT EXISTS image TEXT;`);
    await db.query(`ALTER TABLE brands ADD COLUMN IF NOT EXISTS metadata JSONB;`);

    console.log('✓ Brands table created or already exists');
  } catch (error) {
    console.error('Error creating brands table:', error);
    throw error;
  }
}

async function createBrand(brand) {
  // Map image input to logo_url to match DB schema
  const { name, slug, description = null, logo_url = null, image = null, metadata = null } = brand;
  const finalLogoUrl = logo_url || image;

  const sql = `
    INSERT INTO brands (name, slug, description, logo_url, metadata)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      logo_url = EXCLUDED.logo_url,
      metadata = EXCLUDED.metadata,
      updated_at = now()
    RETURNING *
  `;

  const values = [name, slug, description, finalLogoUrl, metadata];
  const res = await db.query(sql, values);
  return res.rows[0];
}

async function getAllBrands() {
  // Select logo_url as image for backward compatibility if needed, but primarily return logo_url
  const sql = `SELECT *, logo_url as image FROM brands ORDER BY name ASC`;
  const res = await db.query(sql);
  return res.rows;
}

async function getBrandBySlug(slug) {
  const sql = `SELECT *, logo_url as image FROM brands WHERE slug = $1`;
  const res = await db.query(sql, [slug]);
  return res.rows[0] || null;
}

async function getBrandById(id) {
  const sql = `SELECT *, logo_url as image FROM brands WHERE id = $1`;
  const res = await db.query(sql, [id]);
  return res.rows[0] || null;
}

async function updateBrand(id, brand) {
  const { name, slug, description, logo_url, image, metadata } = brand;
  const finalLogoUrl = logo_url || image;

  const sql = `
    UPDATE brands SET
      name = COALESCE($2, name),
      slug = COALESCE($3, slug),
      description = COALESCE($4, description),
      logo_url = COALESCE($5, logo_url),
      metadata = COALESCE($6, metadata),
      updated_at = now()
    WHERE id = $1
    RETURNING *, logo_url as image
  `;

  const values = [id, name, slug, description, finalLogoUrl, metadata];
  const res = await db.query(sql, values);
  return res.rows[0] || null;
}

async function deleteBrand(id) {
  const sql = `DELETE FROM brands WHERE id = $1 RETURNING *`;
  const res = await db.query(sql, [id]);
  return res.rows[0] || null;
}

async function seedBrands() {
  const brands = [
    { name: 'ACEBOTT', slug: 'acebott', description: 'ACEBOTT products' },
    { name: 'Amass', slug: 'amass', description: 'Amass products' },
    { name: 'Arduino', slug: 'arduino', description: 'Arduino development boards and kits' },
    { name: 'BONKA', slug: 'bonka', description: 'BONKA products' },
    { name: 'EFT', slug: 'eft', description: 'EFT products' },
    { name: 'Elcon', slug: 'elcon-india', description: 'Elcon India products' },
    { name: 'EMAX', slug: 'emax', description: 'EMAX products' },
    { name: 'Hobbywing', slug: 'hobbywing', description: 'Hobbywing products' },
    { name: 'JIYI', slug: 'jiyi', description: 'JIYI products' },
    { name: 'Mastech', slug: 'mastech', description: 'Mastech products' },
    { name: 'Raspberry Pi', slug: 'raspberry-pi', description: 'Raspberry Pi boards and accessories' },
    { name: 'SKYDROID', slug: 'skydroid', description: 'SKYDROID products' },
    { name: 'SKYRC', slug: 'skyrc', description: 'SKYRC products' },
    { name: 'TATTU', slug: 'tattu', description: 'TATTU products' }
  ];

  console.log('Seeding brands...');
  for (const brand of brands) {
    try {
      await createBrand(brand);
      console.log(`✓ Created brand: ${brand.name}`);
    } catch (error) {
      console.error(`Error creating brand ${brand.name}:`, error.message);
    }
  }
  console.log('✓ Brands seeding complete');
}

async function getProductCountByBrand(brandSlug) {
  const sql = `
    SELECT COUNT(*) as count FROM products 
    WHERE brand ILIKE $1
  `;
  const res = await db.query(sql, [`%${brandSlug}%`]);
  return parseInt(res.rows[0].count) || 0;
}

module.exports = {
  createTable,
  createBrand,
  getAllBrands,
  getBrandBySlug,
  getBrandById,
  updateBrand,
  deleteBrand,
  seedBrands,
  getProductCountByBrand
};
