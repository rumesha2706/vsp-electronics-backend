/**
 * Cart API Routes
 * Handles cart operations: add, update, remove, get cart
 */

const express = require('express');
const cartModel = require('../db/cart-model');
const { authenticateToken } = require('../middleware/auth-middleware');

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve the current user's shopping cart with all items and totals
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                     itemCount:
 *                       type: integer
 *                     subtotal:
 *                       type: number
 *                     tax:
 *                       type: number
 *                     shipping:
 *                       type: number
 *                     total:
 *                       type: number
 *       401:
 *         description: Unauthorized - token required
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await cartModel.getCart(userId);

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error getting cart:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cart',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/cart/count:
 *   get:
 *     summary: Get cart item count
 *     description: Get the number of items currently in the user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *       401:
 *         description: Unauthorized - token required
 *       500:
 *         description: Internal server error
 */
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await cartModel.getCartCount(userId);

    res.json({
      success: true,
      message: 'Cart count retrieved',
      data: { count }
    });
  } catch (error) {
    console.error('Error getting cart count:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cart count',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the user's shopping cart with specified quantity
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - missing or invalid fields
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized - token required
 *       500:
 *         description: Internal server error
 */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const result = await cartModel.addToCart(userId, productId, quantity);

    // Get updated cart
    const cart = await cartModel.getCart(userId);

    res.json({
      success: true,
      message: result.message,
      data: {
        cartItem: result.cartItem,
        cart: cart
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error.message);

    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/cart/update/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of a product in the user's cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Bad request - invalid quantity
 *       404:
 *         description: Cart item not found
 *       401:
 *         description: Unauthorized - token required
 *       500:
 *         description: Internal server error
 */
router.put('/update/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    const result = await cartModel.updateCartItem(userId, productId, quantity);

    // Get updated cart
    const cart = await cartModel.getCart(userId);

    res.json({
      success: true,
      message: result.message,
      data: {
        cartItem: result.cartItem,
        cart: cart
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error.message);

    if (error.message === 'Cart item not found') {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a product from the user's shopping cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID to remove
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       404:
 *         description: Cart item not found
 *       401:
 *         description: Unauthorized - token required
 *       500:
 *         description: Internal server error
 */
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const result = await cartModel.removeFromCart(userId, productId);

    // Get updated cart
    const cart = await cartModel.getCart(userId);

    res.json({
      success: true,
      message: result.message,
      data: {
        cartItem: result.cartItem,
        cart: cart
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error.message);

    if (error.message === 'Cart item not found') {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     description: Remove all items from the user's shopping cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     itemsCleared:
 *                       type: integer
 *                     cart:
 *                       type: object
 *       401:
 *         description: Unauthorized - token required
 *       500:
 *         description: Internal server error
 */
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await cartModel.clearCart(userId);

    res.json({
      success: true,
      message: result.message,
      data: {
        itemsCleared: result.itemsCleared,
        cart: {
          items: [],
          itemCount: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
          empty: true
        }
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
});

module.exports = router;
