const express = require('express');
const router = express.Router();
const db = require('../db/index.js');

// POST - Create new order
router.post('/', async (req, res) => {
  console.log('\n=== POST /api/guest-orders ===');
  console.log('Body:', req.body);
  
  let client;
  try {
    const { customer, items, deliveryAddress, pricing, paymentMethod } = req.body;
    
    // Validate
    if (!customer || !customer.email || !items || !deliveryAddress || !pricing) {
      console.log('❌ Validation failed');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get DB connection
    console.log('📍 Getting DB connection...');
    client = await db.pool.connect();
    console.log('✅ DB connection acquired');
    
    // Start transaction
    console.log('📍 Starting transaction...');
    await client.query('BEGIN');
    console.log('✅ Transaction started');
    
    const orderNumber = `ORD-${Date.now()}`;
    
    // Insert order
    console.log('📍 Inserting order...');
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, order_number, status, subtotal, tax, shipping, total, payment_method, payment_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, order_number, total`,
      [null, orderNumber, 'pending', pricing.subtotal, pricing.tax, pricing.shipping, pricing.total, paymentMethod || 'cod', 'pending']
    );
    
    const orderId = orderRes.rows[0].id;
    console.log('✅ Order inserted:', orderNumber, 'ID:', orderId);
    
    // Insert items
    console.log('📍 Inserting order items...');
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price_per_item, item_total, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [orderId, item.productId || null, item.productName || 'Unknown', item.quantity, item.price, item.subtotal || (item.quantity * item.price)]
      );
    }
    console.log('✅ Items inserted:', items.length);
    
    // Insert address
    console.log('📍 Inserting address...');
    await client.query(
      `INSERT INTO order_shipping_addresses (order_id, first_name, last_name, email, phone, address, city, state, zip_code, country, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [orderId, customer.firstName, customer.lastName, customer.email, customer.phone, deliveryAddress.street, deliveryAddress.city, deliveryAddress.state, deliveryAddress.pincode, deliveryAddress.country]
    );
    console.log('✅ Address inserted');
    
    // Commit
    console.log('📍 Committing transaction...');
    await client.query('COMMIT');
    console.log('✅ Transaction committed');
    
    // Release connection
    if (client) {
      client.release();
      console.log('✅ Connection released');
    }
    
    // Send response
    console.log('📤 Sending success response');
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId,
        orderNumber: orderRes.rows[0].order_number,
        totalAmount: orderRes.rows[0].total
      }
    });
    
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    console.log('Stack:', err.stack);
    
    if (client) {
      try {
        console.log('📍 Rolling back...');
        await client.query('ROLLBACK');
        console.log('✅ Rolled back');
        client.release();
      } catch (rollbackErr) {
        console.log('❌ Rollback error:', rollbackErr.message);
      }
    }
    
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// GET - Fetch orders by email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('GET /api/guest-orders/:email - email:', email);
    
    const result = await db.query(
      `SELECT o.id, o.order_number, o.total, o.status, o.created_at 
       FROM orders o
       JOIN order_shipping_addresses osa ON o.id = osa.order_id
       WHERE osa.email = $1
       ORDER BY o.created_at DESC`,
      [email]
    );
    
    console.log('Found orders:', result.rows.length);
    res.json({
      success: true,
      orders: result.rows || [],
      total: result.rows ? result.rows.length : 0
    });
  } catch (err) {
    console.error('GET Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
