const db = require('./index');

const CREATE_PRODUCT_IMAGES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position INT DEFAULT 0,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_position ON product_images(product_id, position);
`;

async function createTable() {
  try {
    await db.query(CREATE_PRODUCT_IMAGES_TABLE_SQL);
    console.log('✓ Product images table created');
  } catch (error) {
    console.error('Error creating product_images table:', error);
    throw error;
  }
}

// Get all images for a product
async function getProductImages(productId) {
  const sql = `
    SELECT id, product_id, image_url, position, alt_text, is_primary, created_at, updated_at
    FROM product_images
    WHERE product_id = $1
    ORDER BY position, created_at
  `;
  const res = await db.query(sql, [productId]);
  return res.rows;
}

// Get primary image for a product
async function getPrimaryImage(productId) {
  const sql = `
    SELECT id, product_id, image_url, position, alt_text, is_primary
    FROM product_images
    WHERE product_id = $1 AND is_primary = true
    LIMIT 1
  `;
  const res = await db.query(sql, [productId]);
  return res.rows[0] || null;
}

// Add image to product
async function addProductImage(productId, imageUrl, altText = null, position = null) {
  // If no position provided, get the next position
  if (position === null) {
    const maxRes = await db.query(
      'SELECT MAX(position) as max_pos FROM product_images WHERE product_id = $1',
      [productId]
    );
    position = (maxRes.rows[0].max_pos || 0) + 1;
  }

  const sql = `
    INSERT INTO product_images (product_id, image_url, position, alt_text, is_primary)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const res = await db.query(sql, [productId, imageUrl, position, altText, false]);
  return res.rows[0];
}

// Update product image
async function updateProductImage(imageId, updates) {
  const allowedFields = ['image_url', 'position', 'alt_text', 'is_primary'];
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClauses.push(`${key} = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (setClauses.length === 0) return null;

  values.push(imageId);
  setClauses.push(`updated_at = now()`);

  const sql = `UPDATE product_images SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const res = await db.query(sql, values);
  return res.rows[0];
}

// Set image as primary
async function setPrimaryImage(productId, imageId) {
  // First, unset all other primary images for this product
  await db.query(
    'UPDATE product_images SET is_primary = false WHERE product_id = $1',
    [productId]
  );

  // Set the new primary image
  const res = await db.query(
    'UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2 RETURNING *',
    [imageId, productId]
  );
  return res.rows[0];
}

// Delete product image
async function deleteProductImage(imageId) {
  const res = await db.query(
    'DELETE FROM product_images WHERE id = $1 RETURNING *',
    [imageId]
  );
  return res.rows[0];
}

// Delete all images for a product
async function deleteProductImages(productId) {
  const res = await db.query(
    'DELETE FROM product_images WHERE product_id = $1',
    [productId]
  );
  return res.rows;
}

// Reorder images
async function reorderImages(productId, imageOrder) {
  // imageOrder: [{id: 1, position: 1}, {id: 2, position: 2}, ...]
  for (const item of imageOrder) {
    await db.query(
      'UPDATE product_images SET position = $1 WHERE id = $2 AND product_id = $3',
      [item.position, item.id, productId]
    );
  }
  return getProductImages(productId);
}

module.exports = {
  createTable,
  getProductImages,
  getPrimaryImage,
  addProductImage,
  updateProductImage,
  setPrimaryImage,
  deleteProductImage,
  deleteProductImages,
  reorderImages
};
