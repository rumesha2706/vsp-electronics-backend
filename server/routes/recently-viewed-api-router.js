const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * POST /api/recently-viewed
 * Add a product to user's recently viewed list
 */
router.post('/', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        error: 'userId and productId are required'
      });
    }

    // Upsert recently viewed record
    await pool.query(
      `INSERT INTO recently_viewed (user_id, product_id, viewed_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET viewed_at = NOW()`,
      [userId, productId]
    );

    res.json({
      success: true,
      message: 'Product added to recently viewed'
    });

  } catch (error) {
    console.error('Error adding to recently viewed:', error);
    res.status(500).json({
      error: 'Failed to add product to recently viewed'
    });
  }
});

/**
 * GET /api/recently-viewed/:userId
 * Get user's recently viewed products
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(
      `SELECT p.*, rv.viewed_at
       FROM recently_viewed rv
       JOIN products p ON rv.product_id = p.id
       WHERE rv.user_id = $1
       ORDER BY rv.viewed_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    // Transform to match product format
    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      category: row.category,
      subcategory: row.subcategory,
      brand: row.brand,
      rating: parseFloat(row.rating),
      inStock: row.in_stock,
      isHot: row.is_hot,
      isNew: row.is_new,
      image: row.image,
      description: row.description,
      productUrl: row.product_url,
      sku: row.sku,
      viewedAt: row.viewed_at
    }));

    res.json({
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error fetching recently viewed:', error);
    res.status(500).json({
      error: 'Failed to fetch recently viewed products'
    });
  }
});

/**
 * DELETE /api/recently-viewed/:userId/:productId
 * Remove product from user's recently viewed list
 */
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const result = await pool.query(
      `DELETE FROM recently_viewed 
       WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );

    res.json({
      success: true,
      message: 'Product removed from recently viewed',
      deletedRows: result.rowCount
    });

  } catch (error) {
    console.error('Error removing from recently viewed:', error);
    res.status(500).json({
      error: 'Failed to remove product from recently viewed'
    });
  }
});

/**
 * DELETE /api/recently-viewed/:userId
 * Clear user's recently viewed list
 */
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `DELETE FROM recently_viewed WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Recently viewed list cleared',
      deletedRows: result.rowCount
    });

  } catch (error) {
    console.error('Error clearing recently viewed:', error);
    res.status(500).json({
      error: 'Failed to clear recently viewed list'
    });
  }
});

module.exports = router;
