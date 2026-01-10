/**
 * Products API Router
 * Handles all product-related API endpoints (CRUD operations)
 */

const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Database integration
// Database integration
const productsModel = require('../db/products-model');
const USE_DB = !!(process.env.DATABASE_URL || process.env.PG_CONN);

// Fallback in-memory store when DB not configured
const products = new Map();
let productIdCounter = 1;

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     description: Retrieve all products with optional filtering by category, subcategory, brand, and search terms. Supports pagination.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category
 *         example: Raspberry
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *         description: Filter by product subcategory
 *         example: RPI Accessories
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by product brand
 *         example: Generic
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name or description
 *         example: Camera
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of products per page
 *         example: 12
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of products to skip
 *         example: 0
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductList'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', async (req, res) => {
  console.log('📍 GET / handler called');
  try {
    const { category, subcategory, brand, search, limit = 50, offset = 0 } = req.query;
    console.log('📍 Parameters parsed:', { category, subcategory, brand, search, limit, offset });

    if (USE_DB) {
      console.log('📍 Using database - calling getAll 1');
      // Use DB queries with filter params including subcategory
      const rows = await productsModel.getAll({ limit: parseInt(limit), offset: parseInt(offset), category, subcategory, brand, search });
      console.log('📍 First getAll returned:', rows ? rows.length : 'null');
      // Get total count matching filters
      console.log('📍 Calling getAll 2 for count');
      const allRows = await productsModel.getAll({ limit: 1000000, offset: 0, category, subcategory, brand, search });
      console.log('📍 Second getAll returned:', allRows ? allRows.length : 'null');
      const total = allRows.length;

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      });
    }

    console.log('📍 Using fallback in-memory products');
    const { category: cat, subcategory: subcat, brand: br, search: srch } = req.query;
    let filteredProducts = Array.from(products.values());

    // Filter by category
    if (cat) {
      const normalized = cat.toLowerCase().replace(/[-\/]+/g, ' ').replace(/\s+/g, ' ').trim();
      filteredProducts = filteredProducts.filter(p => {
        if (!p.category) return false;
        const productCat = p.category.toLowerCase().replace(/[-\/]+/g, ' ').replace(/\s+/g, ' ').trim();
        return productCat.includes(normalized) || normalized.includes(productCat);
      });
    }

    // Filter by subcategory
    if (subcat) {
      const normalized = subcat.toLowerCase().replace(/[-\/]+/g, ' ').replace(/\s+/g, ' ').trim();
      filteredProducts = filteredProducts.filter(p => {
        if (!p.subcategory) return false;
        const productSubcat = p.subcategory.toLowerCase().replace(/[-\/]+/g, ' ').replace(/\s+/g, ' ').trim();
        return productSubcat.includes(normalized) || normalized.includes(productSubcat);
      });
    }

    // Filter by brand
    if (br) {
      filteredProducts = filteredProducts.filter(p =>
        p.brand.toLowerCase() === br.toLowerCase()
      );
    }

    // Search by name or description
    if (srch) {
      const searchLower = srch.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // If category filter returned no results, try a fallback search by tokens
    if (cat && filteredProducts.length === 0) {
      const tokens = cat.toLowerCase().replace(/[-\/]+/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
      const allProducts = Array.from(products.values());
      const fallback = allProducts.filter(p => {
        const hay = ((p.name || '') + ' ' + (p.description || '') + ' ' + (p.subcategory || '') + ' ' + (p.category || '')).toLowerCase();
        return tokens.some(t => t.length > 1 ? hay.includes(t) : false);
      });
      if (fallback.length > 0) {
        console.log(`🔎 Category '${cat}' had 0 direct matches — returning ${fallback.length} fallback matches by token search.`);
        filteredProducts = fallback;
      }
    }

    // Pagination
    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: paginatedProducts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('🔴 ERROR in GET / route:', error.message);
    console.error('🔴 Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve a single product by its unique identifier
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "1"
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (USE_DB) {
      const product = await productsModel.getById(id);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product with ID ${id} not found` });
      }

      // Get recent purchase count
      const recentPurchaseCount = await productsModel.getRecentPurchaseCount(id);
      product.recentPurchaseCount = recentPurchaseCount;

      return res.status(200).json({ success: true, data: product });
    }

    const product = products.get(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product with the provided details
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: Arduino Starter Kit
 *               price:
 *                 type: number
 *                 example: 1299.99
 *               description:
 *                 type: string
 *                 example: Complete Arduino starter kit with sensors and components
 *               category:
 *                 type: string
 *                 example: DIY Kits
 *               brand:
 *                 type: string
 *                 example: Arduino
 *               image:
 *                 type: string
 *                 example: /assets/images/arduino-kit.jpg
 *               inStock:
 *                 type: boolean
 *                 example: true
 *               isHot:
 *                 type: boolean
 *                 example: false
 *               isNew:
 *                 type: boolean
 *                 example: true
 *               rating:
 *                 type: number
 *                 example: 4.5
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * POST /api/products/download-image
 * Download and save image from URL locally
 */
router.post('/download-image', async (req, res) => {
  try {
    const { imageUrl, productName, category } = req.body;

    // Validate inputs
    if (!imageUrl || !productName || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: imageUrl, productName, category'
      });
    }

    // Create category folder if it doesn't exist
    const categorySlug = category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const productsDir = path.join(process.cwd(), 'public/assets/images/products', categorySlug);

    if (!fs.existsSync(productsDir)) {
      fs.mkdirSync(productsDir, { recursive: true });
    }

    // Slugify product name for filename
    const productSlug = productName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 120);

    const filename = `${productSlug}.jpg`;
    const filepath = path.join(productsDir, filename);

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      return res.json({
        success: true,
        message: 'Image already exists',
        imagePath: `/assets/images/products/${categorySlug}/${filename}`
      });
    }

    // Download image from URL
    return new Promise((resolve) => {
      const downloadProtocol = imageUrl.startsWith('https') ? https : http;

      downloadProtocol.get(imageUrl, { timeout: 10000 }, (response) => {
        if (response.statusCode !== 200) {
          return resolve(res.status(400).json({
            success: false,
            error: `Failed to download image: HTTP ${response.statusCode}`
          }));
        }

        const file = fs.createWriteStream(filepath);
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          res.json({
            success: true,
            message: 'Image downloaded successfully',
            imagePath: `/assets/images/products/${categorySlug}/${filename}`
          });
          resolve();
        });

        file.on('error', (err) => {
          fs.unlink(filepath, () => { }); // Delete incomplete file
          resolve(res.status(500).json({
            success: false,
            error: 'Failed to save image: ' + err.message
          }));
        });
      }).on('error', (err) => {
        resolve(res.status(500).json({
          success: false,
          error: 'Failed to download image: ' + err.message
        }));
      });
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, price, description, category, subcategory, product_url, brand, image, inStock, isHot, isNew, isFeatured, rating } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, price, category'
      });
    }

    if (USE_DB) {
      const p = {
        name,
        price,
        description: description || '',
        category,
        subcategory: subcategory || null,
        product_url: product_url || null,
        brand: brand || 'Generic',
        image: image || '/assets/images/products/placeholder.jpg',
        inStock: inStock !== undefined ? inStock : true,
        isHot: isHot || false,
        isNew: isNew || false,
        isFeatured: isFeatured || false,
        rating: rating || 0
      };

      const created = await productsModel.insertProduct(p);
      return res.status(201).json({ success: true, data: created });
    }

    const product = {
      id: productIdCounter++,
      name,
      price,
      description: description || '',
      category,
      brand: brand || 'Generic',
      image: image || '/assets/images/products/placeholder.jpg',
      inStock: inStock !== undefined ? inStock : true,
      isHot: isHot || false,
      isNew: isNew || false,
      isFeatured: isFeatured || false,
      rating: rating || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    products.set(product.id.toString(), product);

    console.log(`✅ Product created: ${product.name} (ID: ${product.id})`);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update an existing product by its ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               image:
 *                 type: string
 *               inStock:
 *                 type: boolean
 *               isHot:
 *                 type: boolean
 *               isNew:
 *                 type: boolean
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (USE_DB) {
      // Use database
      const product = await productsModel.getById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${id} not found`
        });
      }

      const updated = await productsModel.updateProduct(id, req.body);
      console.log(`✅ Product updated: ${updated.name} (ID: ${id})`);

      return res.status(200).json({
        success: true,
        data: updated
      });
    }

    // Fallback to in-memory store
    const product = products.get(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`
      });
    }

    // Update fields
    const updateData = req.body;
    const updatedProduct = {
      ...product,
      ...updateData,
      id: product.id, // Don't allow ID change
      createdAt: product.createdAt, // Don't change creation date
      updatedAt: new Date()
    };

    products.set(id, updatedProduct);

    console.log(`✅ Product updated: ${updatedProduct.name} (ID: ${id})`);

    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product by its ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "1"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product 1 deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (USE_DB) {
      // Use database
      const product = await productsModel.getById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${id} not found`
        });
      }

      await productsModel.deleteProduct(id);
      console.log(`✅ Product deleted: ${product.name} (ID: ${id})`);

      return res.status(200).json({
        success: true,
        message: `Product ${id} deleted successfully`
      });
    }

    // Fallback to in-memory store
    const product = products.get(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`
      });
    }

    products.delete(id);

    console.log(`✅ Product deleted: ${product.name} (ID: ${id})`);

    res.status(200).json({
      success: true,
      message: `Product ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/products/bulk/import:
 *   post:
 *     summary: Bulk import products
 *     description: Import multiple products at once from an array of product data
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkImportRequest'
 *     responses:
 *       201:
 *         description: Products imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "15 products imported"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request - invalid data format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/bulk/import', async (req, res) => {
  try {
    const { productsData } = req.body;

    if (!Array.isArray(productsData)) {
      return res.status(400).json({ success: false, error: 'productsData must be an array' });
    }

    const importedProducts = [];
    const errors = [];

    if (USE_DB) {
      for (let index = 0; index < productsData.length; index++) {
        const item = productsData[index];
        try {
          const { name, price, description, category, subcategory, product_url, brand, image, inStock, isHot, isNew, rating } = item;
          if (!name || !price || !category) {
            errors.push(`Item ${index}: Missing required fields`);
            continue;
          }
          const p = {
            name,
            price,
            description,
            category,
            subcategory: subcategory || null,
            product_url: product_url || null,
            brand: brand || 'Generic',
            image: image || '/assets/images/products/placeholder.jpg',
            inStock: inStock !== undefined ? inStock : true,
            isHot: isHot || false,
            isNew: isNew || false,
            rating: rating || 0
          };
          const created = await productsModel.insertProduct(p);
          importedProducts.push(created);
        } catch (err) {
          errors.push(`Item ${index}: ${err.message}`);
        }
      }

      return res.status(200).json({ success: true, imported: importedProducts.length, details: importedProducts, errors });
    }

    // Fallback: in-memory import
    productsData.forEach((item, index) => {
      try {
        const { name, price, description, category, brand, image, inStock, isHot, isNew, rating } = item;

        if (!name || !price || !category) {
          errors.push(`Item ${index}: Missing required fields`);
          return;
        }

        const product = {
          id: productIdCounter++,
          name,
          price,
          description: description || '',
          category,
          brand: brand || 'Generic',
          image: image || '/assets/images/products/placeholder.jpg',
          inStock: inStock !== undefined ? inStock : true,
          isHot: isHot || false,
          isNew: isNew || false,
          rating: rating || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        products.set(product.id.toString(), product);
        importedProducts.push(product);
      } catch (error) {
        errors.push(`Item ${index}: ${error.message}`);
      }
    });

    res.status(200).json({ success: true, imported: importedProducts.length, details: importedProducts, errors });
  } catch (error) {
    console.error('Error during bulk import:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/products/admin/clear:
 *   delete:
 *     summary: Clear all products (Admin only)
 *     description: Delete all products from the database. Use with caution!
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: All products cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All 150 products have been cleared"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/admin/clear', async (req, res) => {
  try {
    if (USE_DB) {
      await productsModel.clearAll();
      console.log('⚠️ All products cleared from DB');
      return res.status(200).json({ success: true, message: 'All products have been cleared' });
    }

    const count = products.size;
    products.clear();
    productIdCounter = 1;

    console.log(`⚠️ All products cleared! (${count} products removed)`);

    res.status(200).json({
      success: true,
      message: `All ${count} products have been cleared`
    });
  } catch (error) {
    console.error('Error clearing products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/products/stats/summary:
 *   get:
 *     summary: Get product statistics
 *     description: Retrieve comprehensive statistics about products including counts, categories, brands, and pricing information
 *     tags:
 *       - Statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statistics'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats/summary', (req, res) => {
  try {
    const allProducts = Array.from(products.values());
    const categories = new Set(allProducts.map(p => p.category));
    const brands = new Set(allProducts.map(p => p.brand));

    const stats = {
      totalProducts: allProducts.length,
      totalCategories: categories.size,
      totalBrands: brands.size,
      hotProducts: allProducts.filter(p => p.isHot).length,
      newProducts: allProducts.filter(p => p.isNew).length,
      inStock: allProducts.filter(p => p.inStock).length,
      outOfStock: allProducts.filter(p => !p.inStock).length,
      averageRating: (allProducts.reduce((sum, p) => sum + p.rating, 0) / allProducts.length).toFixed(2),
      priceRange: {
        min: Math.min(...allProducts.map(p => p.price)),
        max: Math.max(...allProducts.map(p => p.price))
      },
      categories: Array.from(categories),
      brands: Array.from(brands)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
