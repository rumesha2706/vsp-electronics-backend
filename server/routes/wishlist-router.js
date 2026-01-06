/**
 * Wishlist Router
 * Handles wishlist operations
 */

const express = require('express');
const router = express.Router();
const wishlistModel = require('../db/wishlist-model');
const { authenticateToken } = require('../middleware/auth-middleware');

// Public: None (Wishlist is user-specific)
// Protected: All

/**
 * GET /api/wishlist
 * Get user's wishlist
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await wishlistModel.getWishlist(req.user.userId);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/wishlist/add
 * Add item to wishlist
 */
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;
        console.log('Wishlist Add - User:', req.user);
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID required' });
        }

        const result = await wishlistModel.addToWishlist(req.user.userId, productId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/wishlist/:productId
 * Remove item from wishlist
 */
router.delete('/:productId', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.productId;
        const result = await wishlistModel.removeFromWishlist(req.user.userId, productId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/wishlist/check/:productId
 * Check if product is in wishlist
 */
router.get('/check/:productId', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.productId;
        const exists = await wishlistModel.isInWishlist(req.user.userId, productId);
        res.json({ inWishlist: exists });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
