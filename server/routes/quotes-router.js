/**
 * Quotes Router
 * Handles RFQ operations
 */

const express = require('express');
const router = express.Router();
const quotesModel = require('../db/quotes-model');
const { authenticateToken, optionalAuth, authenticateAdmin } = require('../middleware/auth-middleware');

/**
 * POST /api/quotes/create
 * Create a new quote request
 */
router.post('/create', optionalAuth, async (req, res) => {
    try {
        const { items, contactInfo } = req.body;

        // If authenticated, use user ID, otherwise user logic is needed (skipped for now, assuming Auth or guest ID provided in body if sophisticated, but here checking optionalAuth)
        // Actually, similar to orders, we might want to create a guest user.
        // For simplicity, we allow null user_id if not logged in, but require contact info.

        const userId = req.user ? req.user.userId : null;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Items required' });
        }

        if (!contactInfo || (!contactInfo.email && !userId)) {
            return res.status(400).json({ success: false, message: 'Contact info required' });
        }

        const result = await quotesModel.createQuote(userId, items, contactInfo);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/quotes
 * Get user's quotes
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const quotes = await quotesModel.getUserQuotes(req.user.userId);
        res.json({ success: true, data: quotes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/quotes/admin/all
 * Get all quotes (Admin)
 */
router.get('/admin/all', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const quotes = await quotesModel.getAllQuotes();
        res.json({ success: true, data: quotes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/quotes/:id
 * Get single quote
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const quote = await quotesModel.getQuote(req.params.id);

        if (!quote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        // Access check: Admin or Owner
        if (req.user.role !== 'admin' && quote.user_id !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        res.json({ success: true, data: quote });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
