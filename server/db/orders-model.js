/**
 * Orders Model
 * Manages user orders and order history
 */

const db = require('./index.js');

class OrdersModel {
  /**
   * Create orders tables
   */
  async createTables() {
    try {
      // Main orders table
      await db.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          order_number VARCHAR(50) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          subtotal DECIMAL(10, 2) NOT NULL,
          tax DECIMAL(10, 2) NOT NULL,
          shipping DECIMAL(10, 2) NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          payment_method VARCHAR(100),
          payment_status VARCHAR(50) DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Order items table
      await db.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          product_name VARCHAR(255),
          product_image VARCHAR(500),
          quantity INTEGER NOT NULL,
          price_per_item DECIMAL(10, 2) NOT NULL,
          item_total DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);

      // Shipping address table
      await db.query(`
        CREATE TABLE IF NOT EXISTS order_shipping_addresses (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL UNIQUE,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          email VARCHAR(100),
          phone VARCHAR(20),
          address VARCHAR(255),
          city VARCHAR(100),
          state VARCHAR(100),
          zip_code VARCHAR(20),
          country VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
      `);

      // Create indexes
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)
      `);

      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
      `);

      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)
      `);

      return true;
    } catch (error) {
      console.error('Error creating orders tables:', error.message);
      throw error;
    }
  }

  /**
   * Create order from cart
   */
  async createOrder(userId, cartItems, shippingAddress, paymentMethod) {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${userId}`;

      // Calculate totals
      let subtotal = 0;
      cartItems.forEach(item => {
        subtotal += parseFloat(item.item_total) || 0;
      });

      const tax = parseFloat((subtotal * 0.1).toFixed(2));
      const shipping = cartItems.length > 0 ? 50 : 0;
      const total = parseFloat((subtotal + tax + shipping).toFixed(2));

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, order_number, subtotal, tax, shipping, total, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, orderNumber, subtotal, tax, shipping, total, paymentMethod]
      );

      const orderId = orderResult.rows[0].id;

      // Insert order items
      for (const item of cartItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price_per_item, item_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderId, item.product_id, item.name, item.image, item.quantity, item.price_at_add, item.item_total]
        );
      }

      // Insert shipping address
      if (shippingAddress) {
        await client.query(
          `INSERT INTO order_shipping_addresses 
           (order_id, first_name, last_name, email, phone, address, city, state, zip_code, country)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            orderId,
            shippingAddress.firstName,
            shippingAddress.lastName,
            shippingAddress.email,
            shippingAddress.phone,
            shippingAddress.address,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.zipCode,
            shippingAddress.country
          ]
        );
      }

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Order created successfully',
        order: orderResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get order details with items and shipping
   */
  async getOrder(orderId, userId) {
    try {
      // Get order info
      const orderResult = await db.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [orderId, userId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      // Get order items
      const itemsResult = await db.query(
        `SELECT * FROM order_items WHERE order_id = $1
         ORDER BY created_at ASC`,
        [orderId]
      );

      // Get shipping address
      const shippingResult = await db.query(
        'SELECT * FROM order_shipping_addresses WHERE order_id = $1',
        [orderId]
      );

      return {
        ...order,
        items: itemsResult.rows,
        shipping: shippingResult.rows[0] || null,
        itemCount: itemsResult.rows.length
      };
    } catch (error) {
      console.error('Error getting order:', error.message);
      throw error;
    }
  }

  /**
   * Get order by order number (public ID)
   */
  async getOrderByNumber(orderNumber) {
    try {
      // Get order info
      const orderResult = await db.query(
        'SELECT * FROM orders WHERE order_number = $1',
        [orderNumber]
      );

      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }

      const order = orderResult.rows[0];

      // Get order items
      const itemsResult = await db.query(
        `SELECT * FROM order_items WHERE order_id = $1
         ORDER BY created_at ASC`,
        [order.id]
      );

      // Get shipping address
      const shippingResult = await db.query(
        'SELECT * FROM order_shipping_addresses WHERE order_id = $1',
        [order.id]
      );

      return {
        ...order,
        items: itemsResult.rows,
        shipping: shippingResult.rows[0] || null,
        itemCount: itemsResult.rows.length
      };
    } catch (error) {
      console.error('Error getting order by number:', error.message);
      throw error;
    }
  }

  /**
   * Get user's order history
   */
  async getUserOrders(userId, limit = 50, offset = 0) {
    try {
      // Get total count
      const countResult = await db.query(
        'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
        [userId]
      );

      // Get orders with pagination
      const ordersResult = await db.query(
        `SELECT 
           o.*,
           COUNT(oi.id) as item_count
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = $1
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return {
        orders: ordersResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit,
          offset,
          pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user orders:', error.message);
      throw error;
    }
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(limit = 50, offset = 0, status = null) {
    try {
      let query = `
        SELECT 
          o.*,
          u.email as user_email,
          u.first_name,
          u.last_name,
          COUNT(oi.id) as item_count
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
      `;

      const params = [];

      if (status) {
        query += ' WHERE o.status = $1';
        params.push(status);
      }

      query += ` GROUP BY o.id, u.id
                 ORDER BY o.created_at DESC
                 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

      params.push(limit, offset);

      const result = await db.query(query, params);

      return {
        orders: result.rows,
        pagination: {
          limit,
          offset,
          returned: result.rows.length
        }
      };
    } catch (error) {
      console.error('Error getting all orders:', error.message);
      throw error;
    }
  }

  /**
   * Delete an order
   */
  async deleteOrder(orderId) {
    try {
      // Be careful with foreign keys. Assuming cascade or manual cleanup.
      // Order items usually cascade. Shipping addresses?
      // Let's use a transaction to be safe if manual cleanup needed, or just relying on cascade.
      // Assuming simple delete for now based on schema.
      const result = await db.query(
        'DELETE FROM orders WHERE id = $1 OR order_number = $1 RETURNING id',
        [orderId]
      );

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        message: 'Order deleted successfully',
        deletedOrderId: result.rows[0].id
      };
    } catch (error) {
      console.error('Error deleting order:', error.message);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    try {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status.Valid statuses: ${validStatuses.join(', ')} `);
      }

      const result = await db.query(
        `UPDATE orders 
         SET status = $2, updated_at = NOW()
         WHERE id = $1
      RETURNING * `,
        [orderId, status]
      );

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        message: `Order status updated to ${status} `,
        order: result.rows[0]
      };
    } catch (error) {
      console.error('Error updating order status:', error.message);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];

      if (!validStatuses.includes(paymentStatus)) {
        throw new Error(`Invalid payment status.Valid statuses: ${validStatuses.join(', ')} `);
      }

      const result = await db.query(
        `UPDATE orders 
         SET payment_status = $2, updated_at = NOW()
         WHERE id = $1
      RETURNING * `,
        [orderId, paymentStatus]
      );

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        message: `Payment status updated to ${paymentStatus} `,
        order: result.rows[0]
      };
    } catch (error) {
      console.error('Error updating payment status:', error.message);
      throw error;
    }
  }

  /**
   * Add order notes
   */
  async addOrderNotes(orderId, notes) {
    try {
      const result = await db.query(
        `UPDATE orders 
         SET notes = $2, updated_at = NOW()
         WHERE id = $1
      RETURNING * `,
        [orderId, notes]
      );

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        message: 'Order notes added',
        order: result.rows[0]
      };
    } catch (error) {
      console.error('Error adding order notes:', error.message);
      throw error;
    }
  }

  /**
   * Get past shipping addresses for a user
   */
  async getPastAddresses(userId) {
    try {
      const result = await db.query(`
        SELECT DISTINCT ON(osa.address, osa.city, osa.zip_code)
      osa.*
        FROM order_shipping_addresses osa
        JOIN orders o ON osa.order_id = o.id
        WHERE o.user_id = $1
        ORDER BY osa.address, osa.city, osa.zip_code, osa.created_at DESC
        LIMIT 5
        `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting past addresses:', error.message);
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    try {
      const result = await db.query(`
      SELECT
      COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        AVG(total) as avg_order_value,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
        FROM orders
        `);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting order stats:', error.message);
      throw error;
    }
  }

  /**
   * Delete an order
   */
  async deleteOrder(orderId) {
    try {
      const result = await db.query(
        'DELETE FROM orders WHERE id = $1 OR order_number = $1 RETURNING id',
        [orderId]
      );

      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        message: 'Order deleted successfully',
        deletedOrderId: result.rows[0].id
      };
    } catch (error) {
      console.error('Error deleting order:', error.message);
      throw error;
    }
  }
}

module.exports = new OrdersModel();
