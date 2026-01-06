const express = require('express');
const productImagesModel = require('../db/product-images-model');
const { authenticateToken } = require('../middleware/auth-middleware');

const router = express.Router();

/**
 * GET /api/products/:productId/images
 * Get all images for a product
 * Public endpoint
 */
router.get('/:productId/images', async (req, res) => {
  try {
    const { productId } = req.params;
    const images = await productImagesModel.getProductImages(parseInt(productId));
    
    res.json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    console.error('Error fetching product images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product images',
      error: error.message
    });
  }
});

/**
 * GET /api/products/:productId/images/primary
 * Get primary image for a product
 * Public endpoint
 */
router.get('/:productId/images/primary', async (req, res) => {
  try {
    const { productId } = req.params;
    const image = await productImagesModel.getPrimaryImage(parseInt(productId));
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'No primary image found'
      });
    }

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error fetching primary image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch primary image',
      error: error.message
    });
  }
});

/**
 * POST /api/products/:productId/images
 * Add new image to product
 * Admin endpoint - requires authentication
 */
router.post('/:productId/images', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageUrl, altText, position } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'imageUrl is required'
      });
    }

    const image = await productImagesModel.addProductImage(
      parseInt(productId),
      imageUrl,
      altText || null,
      position || null
    );

    res.status(201).json({
      success: true,
      message: 'Image added successfully',
      data: image
    });
  } catch (error) {
    console.error('Error adding product image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product image',
      error: error.message
    });
  }
});

/**
 * PUT /api/products/:productId/images/:imageId
 * Update image details
 * Admin endpoint - requires authentication
 */
router.put('/:productId/images/:imageId', authenticateToken, async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const { imageUrl, altText, position, isPrimary } = req.body;

    const updates = {};
    if (imageUrl) updates.image_url = imageUrl;
    if (altText) updates.alt_text = altText;
    if (position !== undefined) updates.position = position;
    if (isPrimary !== undefined) {
      if (isPrimary) {
        // If setting as primary, handle that separately
        const image = await productImagesModel.setPrimaryImage(
          parseInt(productId),
          parseInt(imageId)
        );
        return res.json({
          success: true,
          message: 'Image set as primary',
          data: image
        });
      } else {
        updates.is_primary = false;
      }
    }

    const image = await productImagesModel.updateProductImage(parseInt(imageId), updates);

    res.json({
      success: true,
      message: 'Image updated successfully',
      data: image
    });
  } catch (error) {
    console.error('Error updating product image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product image',
      error: error.message
    });
  }
});

/**
 * DELETE /api/products/:productId/images/:imageId
 * Delete an image
 * Admin endpoint - requires authentication
 */
router.delete('/:productId/images/:imageId', authenticateToken, async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    const image = await productImagesModel.deleteProductImage(parseInt(imageId));

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: image
    });
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product image',
      error: error.message
    });
  }
});

/**
 * POST /api/products/:productId/images/reorder
 * Reorder images for a product
 * Admin endpoint - requires authentication
 */
router.post('/:productId/images/reorder', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageOrder } = req.body; // [{id: 1, position: 1}, {id: 2, position: 2}, ...]

    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({
        success: false,
        message: 'imageOrder must be an array'
      });
    }

    const images = await productImagesModel.reorderImages(parseInt(productId), imageOrder);

    res.json({
      success: true,
      message: 'Images reordered successfully',
      count: images.length,
      data: images
    });
  } catch (error) {
    console.error('Error reordering images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder images',
      error: error.message
    });
  }
});

module.exports = router;
