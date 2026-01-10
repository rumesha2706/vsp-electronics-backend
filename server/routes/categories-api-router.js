/**
 * Categories API Router
 * Public endpoints for fetching categories, subcategories, and brands
 * Admin endpoints for CRUD operations
 */

const express = require('express');
const router = express.Router();
const categoriesModel = require('../db/categories-model');

// ============================================
// Utility Functions
// ============================================

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * GET /api/categories
 * Fetch all categories
 * Query params:
 *   - homeOnly: boolean (only categories displayed on home)
 *   - includeDetails: boolean (include subcategories and brands)
 */
router.get('/', async (req, res) => {
  try {
    const { homeOnly, includeDetails } = req.query;
    let categories;

    if (homeOnly === 'true') {
      categories = await categoriesModel.getCategoriesForHome();
    } else {
      categories = await categoriesModel.getCategories();
    }

    if (includeDetails === 'true') {
      const withDetails = [];
      for (const cat of categories) {
        const details = await categoriesModel.getCategoryWithDetails(cat.id);
        withDetails.push(details);
      }
      return res.json(withDetails);
    }

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/categories/:id
 * Fetch a single category with all details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoriesModel.getCategoryWithDetails(parseInt(id));

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

/**
 * GET /api/categories/slug/:slug
 * Fetch category by slug
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await categoriesModel.getCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const withDetails = await categoriesModel.getCategoryWithDetails(category.id);
    res.json(withDetails);
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

/**
 * GET /api/categories/:id/subcategories
 * Fetch all subcategories for a category
 */
router.get('/:id/subcategories', async (req, res) => {
  try {
    const { id } = req.params;
    const subcategories = await categoriesModel.getSubcategoriesByCategory(parseInt(id));
    res.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});

/**
 * GET /api/categories/:id/brands
 * Fetch all brands for a category
 */
router.get('/:id/brands', async (req, res) => {
  try {
    const { id } = req.params;
    const brands = await categoriesModel.getBrandsByCategory(parseInt(id));
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// ============================================
// ADMIN ENDPOINTS - CATEGORIES
// ============================================

/**
 * POST /api/categories/admin/create
 * Create a new category (ADMIN)
 * Body: { name, slug?, description?, imageUrl?, displayOnHome?, displayOrder? }
 */
router.post('/admin/create', async (req, res) => {
  try {
    const { name, slug, description, imageUrl, displayOnHome, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categorySlug = slug || slugify(name);

    const category = await categoriesModel.createCategory(
      name,
      categorySlug,
      description || null,
      imageUrl || null,
      displayOnHome || false,
      displayOrder || 0
    );

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Category name or slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

/**
 * PUT /api/categories/admin/:id
 * Update a category (ADMIN)
 */
router.put('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await categoriesModel.updateCategory(parseInt(id), updates);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

/**
 * DELETE /api/categories/admin/:id
 * Delete a category (ADMIN)
 */
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoriesModel.deleteCategory(parseInt(id));

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category deleted successfully',
      category
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============================================
// ADMIN ENDPOINTS - SUBCATEGORIES
// ============================================

/**
 * POST /api/categories/admin/:categoryId/subcategories/create
 * Create a new subcategory (ADMIN)
 */
router.post('/admin/:categoryId/subcategories/create', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, slug, description, imageUrl, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Subcategory name is required' });
    }

    // Verify category exists
    const category = await categoriesModel.getCategoryById(parseInt(categoryId));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subSlug = slug || slugify(name);

    const subcategory = await categoriesModel.createSubcategory(
      parseInt(categoryId),
      name,
      subSlug,
      description || null,
      imageUrl || null,
      displayOrder || 0
    );

    res.status(201).json({
      message: 'Subcategory created successfully',
      subcategory
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    if (error.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Subcategory slug already exists for this category' });
    }
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
});

/**
 * PUT /api/categories/admin/:categoryId/subcategories/:id
 * Update a subcategory (ADMIN)
 */
router.put('/admin/:categoryId/subcategories/:id', async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const updates = req.body;

    const subcategory = await categoriesModel.updateSubcategory(parseInt(id), updates);

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({
      message: 'Subcategory updated successfully',
      subcategory
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ error: 'Failed to update subcategory' });
  }
});

/**
 * DELETE /api/categories/admin/:categoryId/subcategories/:id
 * Delete a subcategory (ADMIN)
 */
router.delete('/admin/:categoryId/subcategories/:id', async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const subcategory = await categoriesModel.deleteSubcategory(parseInt(id));

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({
      message: 'Subcategory deleted successfully',
      subcategory
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
});

// ============================================
// ADMIN ENDPOINTS - BRANDS
// ============================================

/**
 * GET /api/categories/admin/brands
 * Get all brands (ADMIN)
 */
router.get('/admin/brands', async (req, res) => {
  try {
    const brands = await categoriesModel.getBrands();
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

/**
 * POST /api/categories/admin/brands/create
 * Create a new brand (ADMIN)
 * Body: { name, slug?, categoryId?, description?, logoUrl?, websiteUrl? }
 */
router.post('/admin/brands/create', async (req, res) => {
  try {
    const { name, slug, categoryId, description, logoUrl, websiteUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    const brandSlug = slug || slugify(name);

    const brand = await categoriesModel.createBrand(
      name,
      brandSlug,
      categoryId ? parseInt(categoryId) : null,
      description || null,
      logoUrl || null,
      websiteUrl || null
    );

    res.status(201).json({
      message: 'Brand created successfully',
      brand
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    if (error.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Brand name or slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

/**
 * PUT /api/categories/admin/brands/:id
 * Update a brand (ADMIN)
 */
router.put('/admin/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const brand = await categoriesModel.updateBrand(parseInt(id), updates);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({
      message: 'Brand updated successfully',
      brand
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

/**
 * DELETE /api/categories/admin/brands/:id
 * Delete a brand (ADMIN)
 */
router.delete('/admin/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await categoriesModel.deleteBrand(parseInt(id));

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({
      message: 'Brand deleted successfully',
      brand
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// ============================================
// ADMIN ENDPOINTS - CATEGORY ROUTES
// ============================================

/**
 * POST /api/categories/admin/:categoryId/routes/create
 * Create a route for a category (ADMIN)
 */
router.post('/admin/:categoryId/routes/create', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { routeUrl, routeType, metadata } = req.body;

    if (!routeUrl) {
      return res.status(400).json({ error: 'Route URL is required' });
    }

    // Verify category exists
    const category = await categoriesModel.getCategoryById(parseInt(categoryId));
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const route = await categoriesModel.createCategoryRoute(
      parseInt(categoryId),
      routeUrl,
      routeType || 'category',
      metadata || null
    );

    res.status(201).json({
      message: 'Category route created successfully',
      route
    });
  } catch (error) {
    console.error('Error creating category route:', error);
    res.status(500).json({ error: 'Failed to create category route' });
  }
});

/**
 * DELETE /api/categories/admin/routes/:id
 * Delete a category route (ADMIN)
 */
router.delete('/admin/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const route = await categoriesModel.deleteCategoryRoute(parseInt(id));

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({
      message: 'Category route deleted successfully',
      route
    });
  } catch (error) {
    console.error('Error deleting category route:', error);
    res.status(500).json({ error: 'Failed to delete category route' });
  }
});

module.exports = router;
