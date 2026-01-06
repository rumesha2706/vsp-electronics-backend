/**
 * Compare Router
 * Handles compare list operations
 */

const express = require('express');
const router = express.Router();
const compareModel = require('../db/compare-model');
const { authenticateToken } = require('../middleware/auth-middleware');

/**
 * GET /api/compare
 * Get user's compare list
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('GET /api/compare - User:', req.user);
        const result = await compareModel.getCompareList(req.user.userId);
        console.log('GET /api/compare - Result count:', result.count);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/compare/add
 * Add item to compare
 */
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;
        console.log(`POST /api/compare/add - User: ${req.user.userId}, Product: ${productId}`);
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID required' });
        }

        const result = await compareModel.addToCompare(req.user.userId, productId);
        console.log('POST /api/compare/add - Success');
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/compare/:productId
 * Remove item from compare
 */
router.delete('/:productId', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.productId;
        const result = await compareModel.removeFromCompare(req.user.userId, productId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/compare/clear
 * Clear all items
 */
router.delete('/all/clear', authenticateToken, async (req, res) => {
    try {
        const result = await compareModel.clearCompare(req.user.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
