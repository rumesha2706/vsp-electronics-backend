const db = require('./index');

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  category TEXT,
  subcategory VARCHAR(255),
  product_url TEXT,
  brand TEXT,
  price NUMERIC(10,2),
  image TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  stock_count INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  rating NUMERIC(2,1),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);
`;

async function createTable() {
  // Create table if not exists
  await db.query(CREATE_TABLE_SQL);

  // Ensure subcategory and product_url columns exist on existing tables
  await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255);`);
  await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS product_url TEXT;`);

  // Create a unique index on product_url to help prevent duplicate imports when product_url is provided
  await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;`);

  // Create a unique index on product_url to help prevent duplicate imports when product_url is provided
  await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS products_product_url_unique ON products (product_url);`);
}

async function clearAll() {
  await db.query('DELETE FROM products');
}

async function insertProduct(p) {
  // Use product_url if provided — add ON CONFLICT to update when product_url matches to avoid duplicates
  const sql = `INSERT INTO products (name, slug, description, category, subcategory, product_url, brand, price, image, in_stock, stock_count, is_hot, is_new, is_featured, rating, metadata, view_count)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
               ON CONFLICT (product_url) DO UPDATE SET
                 name = EXCLUDED.name,
                 slug = EXCLUDED.slug,
                 description = EXCLUDED.description,
                 category = EXCLUDED.category,
                 subcategory = EXCLUDED.subcategory,
                 brand = EXCLUDED.brand,
                 price = EXCLUDED.price,
                 image = EXCLUDED.image,
                 in_stock = EXCLUDED.in_stock,
                 stock_count = EXCLUDED.stock_count,
                 is_hot = EXCLUDED.is_hot,
                 is_new = EXCLUDED.is_new,
                 is_featured = EXCLUDED.is_featured,
                 rating = EXCLUDED.rating,
                 metadata = EXCLUDED.metadata
               RETURNING *`;

  const values = [
    p.name,
    p.slug || slugify(p.name),
    p.description || null,
    p.category || null,
    p.subcategory || null,
    p.product_url || null,
    p.brand || null,
    p.price || null,
    p.image || null,
    p.inStock !== undefined ? p.inStock : true,
    p.stockCount !== undefined ? p.stockCount : 0,
    p.isHot || false,
    p.isNew || false,
    p.isFeatured || false,
    p.rating || null,
    p.metadata || null,
    0
  ];

  const res = await db.query(sql, values);
  return res.rows[0];
}

function slugify(text) {
  return text ? text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') : '';
}

async function getAll({ limit = 200, offset = 0, category, subcategory, brand, search } = {}) {
  let whereParts = [];
  const params = [];
  let i = 1;

  if (category) {
    whereParts.push(`category ILIKE $${i++}`);
    params.push(`%${category}%`);
  }
  if (subcategory) {
    // Special case: 'null' means filter for products with NULL subcategory
    if (subcategory === 'null') {
      whereParts.push(`subcategory IS NULL`);
    } else {
      // Use exact match (case-insensitive) instead of ILIKE with wildcards
      whereParts.push(`LOWER(subcategory) = LOWER($${i++})`);
      params.push(subcategory);
    }
  }
  if (brand) {
    // Search for brand name OR slug-like version (spaces replaced by dashes)
    whereParts.push(`(brand ILIKE $${i} OR brand ILIKE $${i + 1})`);
    params.push(brand);
    params.push(brand.replace(/\s+/g, '-'));
    i += 2;
  }
  if (search) {
    whereParts.push(`(name ILIKE $${i} OR description ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }

  const where = whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : '';
  const sql = `SELECT * FROM products ${where} ORDER BY id DESC LIMIT $${i++} OFFSET $${i++}`;
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  console.log('Executing SQL:', sql);
  console.log('Params:', params);

  const res = await db.query(sql, params);
  return res.rows;
}

async function getById(id) {
  const res = await db.query('SELECT * FROM products WHERE id = $1', [id]);
  return res.rows[0];
}

async function updateProduct(id, updates) {
  const setClauses = [];
  const params = [];
  let paramIndex = 1;

  // Only update fields that are provided
  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    params.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    params.push(updates.description);
  }
  if (updates.category !== undefined) {
    setClauses.push(`category = $${paramIndex++}`);
    params.push(updates.category);
  }
  if (updates.subcategory !== undefined) {
    setClauses.push(`subcategory = $${paramIndex++}`);
    params.push(updates.subcategory);
  }
  if (updates.brand !== undefined) {
    setClauses.push(`brand = $${paramIndex++}`);
    params.push(updates.brand);
  }
  if (updates.price !== undefined) {
    setClauses.push(`price = $${paramIndex++}`);
    params.push(updates.price);
  }
  if (updates.image !== undefined) {
    setClauses.push(`image = $${paramIndex++}`);
    params.push(updates.image);
  }
  if (updates.inStock !== undefined) {
    setClauses.push(`in_stock = $${paramIndex++}`);
    params.push(updates.inStock);
  }
  if (updates.stockCount !== undefined) {
    setClauses.push(`stock_count = $${paramIndex++}`);
    params.push(updates.stockCount);

    // Auto-update in_stock status if count is 0
    // But ONLY if inStock wasn't explicitly provided in this update (to allow manual override if ever needed, though typical flow suggests 0 = out)
    // Actually user requested: "When product is count is zero automatically make product as out of stock"
    if (updates.stockCount === 0 && updates.inStock === undefined) {
      setClauses.push(`in_stock = $${paramIndex++}`);
      params.push(false);
    }
  }
  if (updates.isHot !== undefined) {
    setClauses.push(`is_hot = $${paramIndex++}`);
    params.push(updates.isHot);
  }
  if (updates.isNew !== undefined) {
    setClauses.push(`is_new = $${paramIndex++}`);
    params.push(updates.isNew);
  }
  if (updates.isFeatured !== undefined) {
    setClauses.push(`is_featured = $${paramIndex++}`);
    params.push(updates.isFeatured);
  }
  if (updates.rating !== undefined) {
    setClauses.push(`rating = $${paramIndex++}`);
    params.push(updates.rating);
  }
  if (updates.metadata !== undefined) {
    setClauses.push(`metadata = $${paramIndex++}`);
    params.push(updates.metadata);
  }
  if (updates.originalPrice !== undefined) {
    setClauses.push(`original_price = $${paramIndex++}`);
    params.push(updates.originalPrice);
  }

  if (setClauses.length === 0) {
    // If no fields to update, just return the product
    return getById(id);
  }

  params.push(id);
  const sql = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

  const res = await db.query(sql, params);
  return res.rows[0];
}

async function deleteProduct(id) {
  const res = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

async function getRecentPurchaseCount(productId) {
  try {
    const sql = `
      SELECT COUNT(DISTINCT 
        CASE 
          WHEN o.user_id IS NOT NULL THEN CAST(o.user_id AS VARCHAR) 
          ELSE osa.email 
        END
      ) as count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN order_shipping_addresses osa ON o.id = osa.order_id
      WHERE oi.product_id = $1
      AND o.created_at > NOW() - INTERVAL '30 days'
    `;
    const res = await db.query(sql, [productId]);
    return parseInt(res.rows[0]?.count || 0);
  } catch (err) {
    console.error('Error getting recent purchase count:', err);
    return 0;
  }
}

async function incrementViewCount(productId) {
  try {
    const sql = `UPDATE products SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1 RETURNING view_count`;
    const res = await db.query(sql, [productId]);
    return res.rows[0]?.view_count || 0;
  } catch (err) {
    console.error('Error incrementing view count:', err);
    return 0;
  }
}

module.exports = {
  createTable,
  clearAll,
  insertProduct,
  getAll,
  getById,
  updateProduct,
  deleteProduct,
  getRecentPurchaseCount,
  incrementViewCount
};
