/**
 * Orders API Router
 * Handles all order-related API endpoints
 */

const express = require('express');
const router = express.Router();
const ordersModel = require('../db/orders-model');
const emailService = require('../services/email-service');
const whatsappService = require('../services/whatsapp-service');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with items and delivery address
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *             properties:
 *               userId:
 *                 type: number
 *               items:
 *                 type: array
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!userId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    console.log('📝 Creating order for user:', userId);
    console.log('📦 Items:', items.length);

    // Map items to expected format if needed
    // Model expects: product_id, name, image, quantity, price_at_add, item_total
    // Frontend likely sends: productId, name, image, quantity, price, etc.
    const cartItems = items.map(item => ({
      product_id: item.productId || item.product_id,
      name: item.name || item.productName,
      image: item.image || item.imageUrl,
      quantity: item.quantity,
      price_at_add: item.price,
      item_total: (item.price * item.quantity).toFixed(2)
    }));

    // Create order in DB
    const result = await ordersModel.createOrder(userId, cartItems, shippingAddress, paymentMethod);

    if (result.success) {
      const order = result.order;

      console.log(`✅ Order created in DB: ${order.order_number}`);

      // Send Order Confirmation Email
      if (shippingAddress && shippingAddress.email) {
        // Construct order details for email
        const orderDetails = {
          orderId: order.order_number,
          totalAmount: order.total,
          items: cartItems
        };

        // Don't await email/whatsapp to avoid blocking response
        emailService.sendOrderConfirmationEmail(shippingAddress.email, shippingAddress.firstName, orderDetails)
          .catch(err => console.error('Failed to send email:', err));

        // Send WhatsApp Notification
        if (shippingAddress.phone) {
          whatsappService.sendOrderConfirmation(shippingAddress.phone, {
            orderId: order.order_number,
            totalAmount: order.total,
            items: cartItems,
            estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          }).catch(err => console.error('Failed to send WhatsApp:', err));
        }
      }

      res.status(201).json({
        success: true,
        order: {
          ...order,
          orderId: order.order_number // Maintain compatibility with frontend expecting orderId
        }
      });
    } else {
      throw new Error('Failed to create order');
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/orders/user:
 *   get:
 *     summary: Get all orders for a user
 *     description: Retrieve all orders for a specific user with pagination
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID to filter orders
 */
router.get('/user', async (req, res) => {
  try {
    const userId = req.query.userId;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await ordersModel.getUserOrders(userId, limit, offset);

    res.json({
      orders: result.orders.map(o => ({
        ...o,
        orderId: o.order_number // Map DB column to frontend expected property
      })),
      total: result.pagination.total,
      page: result.pagination.page || page,
      limit: result.pagination.limit || limit
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get a single order by ID
 *     description: Retrieve detailed information for a specific order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID or Order Number
 */
router.get('/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;

    let order;

    // Check if it's a numeric ID or Order Number string
    if (/^\d+$/.test(orderId)) {
      // It's a numeric ID (rarely used by frontend directly but supported)
      // We need userId ideally, but for now we might fail or mock.
      // However, frontend sends 'ORD-...' usually.
      // Let's assume if it is numeric, we try getOrder assuming we don't strictly check user here (public tracking?)
      // Actually models.getOrder requires userId.
      // So better to search by Number if possible.
      // For now, let's try getOrderByNumber first if it looks like ORD-...
      order = await ordersModel.getOrderByNumber(orderId);
    } else {
      // Assume it's an Order Number string (ORD-...)
      order = await ordersModel.getOrderByNumber(orderId);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      ...order,
      orderId: order.order_number, // Compatibility
      estimatedDeliveryDate: new Date(order.created_at.getTime() + 5 * 24 * 60 * 60 * 1000) // Mock estimated delivery
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}/tracking:
 *   get:
 *     summary: Get order tracking information
 */
router.get('/:orderId/tracking', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await ordersModel.getOrderByNumber(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Generate tracking events based on order status
    const events = generateTrackingEvents(order);

    const tracking = {
      orderId: order.order_number,
      status: order.status,
      location: getLocationByStatus(order.status),
      estimatedDelivery: new Date(order.created_at.getTime() + 5 * 24 * 60 * 60 * 1000),
      lastUpdated: order.updated_at,
      events
    };

    res.json(tracking);
  } catch (error) {
    // console.error('Error fetching tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper function to generate tracking events
 */
function generateTrackingEvents(order) {
  const statuses = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = statuses.indexOf(order.status);

  const events = [
    {
      status: 'confirmed',
      timestamp: order.created_at,
      description: 'Your order has been confirmed',
      icon: '✓'
    }
  ];

  if (currentStatusIndex >= 1) {
    events.push({
      status: 'processing',
      timestamp: new Date(order.created_at.getTime() + 24 * 60 * 60 * 1000),
      description: 'We are preparing your order',
      icon: '⚙️',
      location: 'Warehouse, Mumbai'
    });
  }

  // Add more fake events based on status...
  // For now simple logic is fine as per original mock

  return events;
}

/**
 * Helper function to get location by status
 */
function getLocationByStatus(status) {
  const locations = {
    'pending': 'Processing',
    'confirmed': 'Warehouse, Mumbai',
    'processing': 'Warehouse, Mumbai',
    'shipped': 'In Transit',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return locations[status] || 'Unknown';
}

module.exports = router;
