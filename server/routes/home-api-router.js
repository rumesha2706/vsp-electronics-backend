/**
 * Home API Router
 * Endpoints for featured categories, brands, and products on home page
 */

const express = require('express');
const router = express.Router();
const db = require('../db/index');

/**
 * @swagger
 * /api/home/featured-categories:
 *   get:
 *     summary: Get featured categories with images and product counts
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: Featured categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   image_url:
 *                     type: string
 *                   product_count:
 *                     type: integer
 *                   display_order:
 *                     type: integer
 */
router.get('/featured-categories', async (req, res) => {
  try {
    // First try to get categories with calculated product counts
    const result = await db.query(`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.image_url,
        COALESCE(COUNT(DISTINCT p.id), 0) as product_count,
        c.display_order
      FROM categories c
      LEFT JOIN products p ON (
        LOWER(TRIM(p.category)) = LOWER(TRIM(c.name)) OR
        LOWER(TRIM(p.category)) LIKE '%' || LOWER(TRIM(c.name)) || '%'
      )
      WHERE c.display_on_home = true
      GROUP BY c.id, c.name, c.slug, c.image_url, c.display_order
      ORDER BY c.display_order ASC, c.name ASC
    `);

    console.log('Featured categories result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching featured categories:', err);
    // Fallback: return categories without product count if join fails
    try {
      const fallback = await db.query(`
        SELECT id, name, slug, image_url, 0 as product_count, display_order
        FROM categories
        WHERE display_on_home = true
        ORDER BY display_order ASC, name ASC
      `);
      res.json(fallback.rows);
    } catch (fallbackErr) {
      res.status(500).json({ error: 'Failed to fetch featured categories', details: err.message });
    }
  }
});

/**
 * @swagger
 * /api/home/featured-brands:
 *   get:
 *     summary: Get featured brands with logos and product counts
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: Featured brands retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   logo_url:
 *                     type: string
 *                   website_url:
 *                     type: string
 *                   product_count:
 *                     type: integer
 */
router.get('/featured-brands', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, slug, logo_url, website_url, product_count
      FROM brands
      WHERE is_featured = true OR product_count > 0
      ORDER BY product_count DESC, name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching featured brands:', err);
    res.status(500).json({ error: 'Failed to fetch featured brands' });
  }
});

/**
 * @swagger
 * /api/home/featured-products:
 *   get:
 *     summary: Get featured products
 *     tags:
 *       - Home
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 */
router.get('/featured-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const result = await db.query(`
      SELECT id, name, price, image, category, brand, rating, in_stock
      FROM products
      WHERE is_featured = true
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

/**
 * @swagger
 * /api/home/new-products:
 *   get:
 *     summary: Get new products
 *     tags:
 *       - Home
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: New products retrieved successfully
 */
router.get('/new-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const result = await db.query(`
      SELECT id, name, price, image, category, brand, rating, in_stock
      FROM products
      WHERE is_new = true
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching new products:', err);
    res.status(500).json({ error: 'Failed to fetch new products' });
  }
});

/**
 * @swagger
 * /api/home/top-sellers:
 *   get:
 *     summary: Get top seller products
 *     tags:
 *       - Home
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Top seller products retrieved successfully
 */
router.get('/top-sellers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const result = await db.query(`
      SELECT id, name, price, image, category, brand, rating, in_stock
      FROM products
      WHERE rating IS NOT NULL
      ORDER BY rating DESC, created_at DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top sellers:', err);
    res.status(500).json({ error: 'Failed to fetch top sellers' });
  }
});

/**
 * @swagger
 * /api/home/all:
 *   get:
 *     summary: Get all home page data (categories, brands, and products)
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: All home page data retrieved successfully
 */
router.get('/all', async (req, res) => {
  try {
    // Get categories with calculated product counts
    const categoriesResult = await db.query(`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.image_url,
        COALESCE(COUNT(DISTINCT p.id), 0) as product_count,
        c.display_order
      FROM categories c
      LEFT JOIN products p ON (
        LOWER(TRIM(p.category)) = LOWER(TRIM(c.name)) OR
        LOWER(TRIM(p.category)) LIKE '%' || LOWER(TRIM(c.name)) || '%'
      )
      WHERE c.display_on_home = true
      GROUP BY c.id, c.name, c.slug, c.image_url, c.display_order
      ORDER BY c.display_order ASC, c.name ASC
    `);

    // Get brands from public.brands table
    let brandsResult = { rows: [] };
    try {
      brandsResult = await db.query(`
        SELECT id, name, slug, logo_url, website_url
        FROM public.brands
        ORDER BY name ASC
        LIMIT 12
      `);
      
      // Transform logo URLs to use placeholder if not provided
      brandsResult.rows = brandsResult.rows.map(brand => ({
        ...brand,
        logo_url: brand.logo_url || '/assets/images/placeholder.jpg'
      }));
      
      console.log('Brands fetched:', brandsResult.rows.length);
    } catch (err) {
      console.error('Error fetching brands:', err.message);
      brandsResult = { rows: [] };
    }
    
    console.log('Featured brands fetched:', brandsResult.rows.length);

    // Get featured products
    const featuredResult = await db.query(`
      SELECT id, name, price, image, category, brand, rating, in_stock
      FROM products
      WHERE is_featured = true AND in_stock = true
      ORDER BY created_at DESC
      LIMIT 12
    `);

    // Get new products
    const newResult = await db.query(`
      SELECT id, name, price, image, category, brand, rating, in_stock
      FROM products
      WHERE is_new = true AND in_stock = true
      ORDER BY created_at DESC
      LIMIT 12
    `);

    // Get top sellers by rating
    const topResult = await db.query(`
      SELECT id, name, price, image, category, brand, rating, in_stock
      FROM products
      WHERE rating IS NOT NULL AND rating > 0 AND in_stock = true
      ORDER BY rating DESC, created_at DESC
      LIMIT 12
    `);

    console.log('Home page data fetched successfully');
    console.log('Categories:', categoriesResult.rows.length);
    console.log('Brands:', brandsResult.rows.length);
    console.log('Featured products:', featuredResult.rows.length);

    res.json({
      categories: categoriesResult.rows,
      brands: brandsResult.rows,
      featured: featuredResult.rows,
      new: newResult.rows,
      topSellers: topResult.rows
    });
  } catch (err) {
    console.error('Error fetching home page data:', err);
    res.status(500).json({ error: 'Failed to fetch home page data', details: err.message });
  }
});

module.exports = router;
