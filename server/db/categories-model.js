const db = require('./index');

// ============================================
// Categories, Subcategories & Brands Tables
// ============================================

const CREATE_CATEGORIES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_on_home BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
`;

const CREATE_SUBCATEGORIES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(category_id, slug)
);
`;

const CREATE_BRANDS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
`;

const CREATE_CATEGORY_ROUTES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS category_routes (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  route_url VARCHAR(255) NOT NULL,
  route_type VARCHAR(50) DEFAULT 'category',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
`;

async function createTables() {
  try {
    await db.query(CREATE_CATEGORIES_TABLE_SQL);
    console.log('✓ Categories table created');

    await db.query(CREATE_SUBCATEGORIES_TABLE_SQL);
    console.log('✓ Subcategories table created');

    await db.query(CREATE_BRANDS_TABLE_SQL);
    console.log('✓ Brands table created');

    await db.query(CREATE_CATEGORY_ROUTES_TABLE_SQL);
    console.log('✓ Category routes table created');

    // Create indexes for better performance
    await db.query(`CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_brands_category_id ON brands(category_id);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_category_routes_category_id ON category_routes(category_id);`);
    
    console.log('✓ Indexes created');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// ============================================
// Category Operations
// ============================================

async function getCategories() {
  const res = await db.query('SELECT * FROM categories ORDER BY display_order, name');
  return res.rows;
}

async function getCategoryById(id) {
  const res = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
  return res.rows[0];
}

async function getCategoryBySlug(slug) {
  const res = await db.query('SELECT * FROM categories WHERE slug = $1', [slug]);
  return res.rows[0];
}

async function getCategoriesForHome() {
  const res = await db.query(
    'SELECT * FROM categories WHERE display_on_home = true ORDER BY display_order',
    []
  );
  return res.rows;
}

async function createCategory(name, slug, description, imageUrl, displayOnHome, displayOrder) {
  const sql = `
    INSERT INTO categories (name, slug, description, image_url, display_on_home, display_order)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const res = await db.query(sql, [name, slug, description, imageUrl, displayOnHome || false, displayOrder || 0]);
  return res.rows[0];
}

async function updateCategory(id, updates) {
  const allowedFields = ['name', 'slug', 'description', 'image_url', 'display_on_home', 'display_order'];
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbKey = key === 'imageUrl' ? 'image_url' : key === 'displayOnHome' ? 'display_on_home' : key === 'displayOrder' ? 'display_order' : key;
    if (allowedFields.includes(dbKey)) {
      setClauses.push(`${dbKey} = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  setClauses.push(`updated_at = now()`);

  const sql = `UPDATE categories SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const res = await db.query(sql, values);
  return res.rows[0];
}

async function deleteCategory(id) {
  const res = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

// ============================================
// Subcategory Operations
// ============================================

async function getSubcategoriesByCategory(categoryId) {
  const res = await db.query(
    `SELECT 
      s.id, 
      s.category_id, 
      s.name, 
      s.slug, 
      s.description, 
      s.image_url, 
      s.display_order,
      (SELECT COUNT(*) FROM products WHERE subcategory_id = s.id) as count
    FROM subcategories s 
    WHERE s.category_id = $1 
    ORDER BY s.display_order, s.name`,
    [categoryId]
  );
  return res.rows;
}

async function getSubcategoryById(id) {
  const res = await db.query('SELECT * FROM subcategories WHERE id = $1', [id]);
  return res.rows[0];
}

async function createSubcategory(categoryId, name, slug, description, imageUrl, displayOrder) {
  const sql = `
    INSERT INTO subcategories (category_id, name, slug, description, image_url, display_order)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const res = await db.query(sql, [categoryId, name, slug, description, imageUrl, displayOrder || 0]);
  return res.rows[0];
}

async function updateSubcategory(id, updates) {
  const allowedFields = ['name', 'slug', 'description', 'image_url', 'display_order'];
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbKey = key === 'imageUrl' ? 'image_url' : key === 'displayOrder' ? 'display_order' : key;
    if (allowedFields.includes(dbKey)) {
      setClauses.push(`${dbKey} = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  setClauses.push(`updated_at = now()`);

  const sql = `UPDATE subcategories SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const res = await db.query(sql, values);
  return res.rows[0];
}

async function deleteSubcategory(id) {
  const res = await db.query('DELETE FROM subcategories WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

// ============================================
// Brand Operations
// ============================================

async function getBrands() {
  const res = await db.query('SELECT * FROM brands ORDER BY name');
  return res.rows;
}

async function getBrandsByCategory(categoryId) {
  const res = await db.query(
    'SELECT * FROM brands WHERE category_id = $1 ORDER BY name',
    [categoryId]
  );
  return res.rows;
}

async function getBrandById(id) {
  const res = await db.query('SELECT * FROM brands WHERE id = $1', [id]);
  return res.rows[0];
}

async function getBrandBySlug(slug) {
  const res = await db.query('SELECT * FROM brands WHERE slug = $1', [slug]);
  return res.rows[0];
}

async function createBrand(name, slug, categoryId, description, logoUrl, websiteUrl) {
  const sql = `
    INSERT INTO brands (name, slug, category_id, description, logo_url, website_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const res = await db.query(sql, [name, slug, categoryId || null, description, logoUrl, websiteUrl]);
  return res.rows[0];
}

async function updateBrand(id, updates) {
  const allowedFields = ['name', 'slug', 'category_id', 'description', 'logo_url', 'website_url'];
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    const dbKey = key === 'categoryId' ? 'category_id' : key === 'logoUrl' ? 'logo_url' : key === 'websiteUrl' ? 'website_url' : key;
    if (allowedFields.includes(dbKey)) {
      setClauses.push(`${dbKey} = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  setClauses.push(`updated_at = now()`);

  const sql = `UPDATE brands SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const res = await db.query(sql, values);
  return res.rows[0];
}

async function deleteBrand(id) {
  const res = await db.query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

// ============================================
// Category Routes Operations
// ============================================

async function getCategoryRoutes(categoryId) {
  const res = await db.query(
    'SELECT * FROM category_routes WHERE category_id = $1',
    [categoryId]
  );
  return res.rows;
}

async function createCategoryRoute(categoryId, routeUrl, routeType, metadata) {
  const sql = `
    INSERT INTO category_routes (category_id, route_url, route_type, metadata)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const res = await db.query(sql, [categoryId, routeUrl, routeType, metadata || null]);
  return res.rows[0];
}

async function updateCategoryRoute(id, routeUrl, metadata) {
  const sql = `
    UPDATE category_routes SET route_url = $1, metadata = $2, updated_at = now()
    WHERE id = $3
    RETURNING *
  `;
  const res = await db.query(sql, [routeUrl, metadata, id]);
  return res.rows[0];
}

async function deleteCategoryRoute(id) {
  const res = await db.query('DELETE FROM category_routes WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

// ============================================
// Category with Details
// ============================================

async function getCategoryWithDetails(id) {
  const category = await getCategoryById(id);
  if (!category) return null;

  const subcategories = await getSubcategoriesByCategory(id);
  const brands = await getBrandsByCategory(id);
  const routes = await getCategoryRoutes(id);

  return {
    ...category,
    subcategories,
    brands,
    routes
  };
}

module.exports = {
  createTables,
  // Category
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  getCategoriesForHome,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryWithDetails,
  // Subcategory
  getSubcategoriesByCategory,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  // Brand
  getBrands,
  getBrandsByCategory,
  getBrandById,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  // Category Routes
  getCategoryRoutes,
  createCategoryRoute,
  updateCategoryRoute,
  deleteCategoryRoute
};
