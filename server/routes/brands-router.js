const express = require('express');
const brandsModel = require('../db/brands-model');
const { authenticateToken } = require('../middleware/auth-middleware');

const router = express.Router();

/**
 * GET /api/brands
 * Get all brands
 * Public endpoint - no authentication required
 */
router.get('/', async (req, res) => {
  try {
    const brands = await brandsModel.getAllBrands();
    res.json({
      success: true,
      count: brands.length,
      brands: brands.map(brand => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        image: brand.image,
        metadata: brand.metadata
      }))
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message
    });
  }
});

/**
 * GET /api/brands/:slug
 * Get brand by slug
 * Public endpoint - no authentication required
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = await brandsModel.getBrandBySlug(slug);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        image: brand.image,
        metadata: brand.metadata
      }
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand',
      error: error.message
    });
  }
});

/**
 * POST /api/brands
 * Create a new brand (admin only)
 * Protected endpoint - requires authentication
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, slug, description, image, metadata } = req.body;

    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    const brand = await brandsModel.createBrand({
      name,
      slug,
      description,
      image,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        image: brand.image,
        metadata: brand.metadata
      }
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create brand',
      error: error.message
    });
  }
});

/**
 * PUT /api/brands/:id
 * Update brand (admin only)
 * Protected endpoint - requires authentication
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, metadata } = req.body;

    const brand = await brandsModel.updateBrand(id, {
      name,
      slug,
      description,
      image,
      metadata
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand updated successfully',
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        image: brand.image,
        metadata: brand.metadata
      }
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update brand',
      error: error.message
    });
  }
});

/**
 * DELETE /api/brands/:id
 * Delete brand (admin only)
 * Protected endpoint - requires authentication
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await brandsModel.deleteBrand(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand deleted successfully',
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug
      }
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete brand',
      error: error.message
    });
  }
});

module.exports = router;
