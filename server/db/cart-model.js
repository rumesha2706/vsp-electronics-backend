/**
 * Cart Model
 * Manages shopping cart for users
 */

const db = require('./index.js');

class CartModel {
  /**
   * Create cart table
   */
  async createTable() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          price_at_add DECIMAL(10, 2),
          added_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          UNIQUE(user_id, product_id)
        )
      `);

      // Create index for faster queries
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id)
      `);

      return true;
    } catch (error) {
      console.error('Error creating cart_items table:', error.message);
      throw error;
    }
  }

  /**
   * Add item to cart or update quantity
   */
  async addToCart(userId, productId, quantity = 1) {
    try {
      // Get product price
      const productResult = await db.query(
        'SELECT price FROM products WHERE id = $1',
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      const price = productResult.rows[0].price;

      // Insert or update cart item
      const result = await db.query(
        `INSERT INTO cart_items (user_id, product_id, quantity, price_at_add, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id, product_id) DO UPDATE SET
           quantity = cart_items.quantity + $3,
           updated_at = NOW()
         RETURNING *`,
        [userId, productId, quantity, price]
      );

      return {
        success: true,
        message: 'Item added to cart',
        cartItem: result.rows[0]
      };
    } catch (error) {
      console.error('Error adding to cart:', error.message);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(userId, productId, quantity) {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(userId, productId);
      }

      const result = await db.query(
        `UPDATE cart_items 
         SET quantity = $3, updated_at = NOW()
         WHERE user_id = $1 AND product_id = $2
         RETURNING *`,
        [userId, productId, quantity]
      );

      if (result.rows.length === 0) {
        throw new Error('Cart item not found');
      }

      return {
        success: true,
        message: 'Cart item updated',
        cartItem: result.rows[0]
      };
    } catch (error) {
      console.error('Error updating cart item:', error.message);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId, productId) {
    try {
      const result = await db.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *',
        [userId, productId]
      );

      if (result.rows.length === 0) {
        throw new Error('Cart item not found');
      }

      return {
        success: true,
        message: 'Item removed from cart',
        cartItem: result.rows[0]
      };
    } catch (error) {
      console.error('Error removing from cart:', error.message);
      throw error;
    }
  }

  /**
   * Get user's cart with product details
   */
  async getCart(userId) {
    try {
      const result = await db.query(
        `SELECT 
           ci.id,
           ci.user_id,
           ci.product_id,
           ci.quantity,
           ci.price_at_add,
           ci.added_at,
           p.name,
           p.image,
           p.category,
           p.brand,
           p.price AS current_price,
           p.in_stock,
           (ci.quantity * ci.price_at_add) AS item_total
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.user_id = $1
         ORDER BY ci.added_at DESC`,
        [userId]
      );

      // Calculate totals
      let subtotal = 0;
      result.rows.forEach(item => {
        subtotal += parseFloat(item.item_total) || 0;
      });

      const tax = parseFloat((subtotal * 0.1).toFixed(2)); // 10% tax
      const shipping = result.rows.length > 0 ? 50 : 0; // Free shipping order value
      const total = parseFloat((subtotal + tax + shipping).toFixed(2));

      return {
        items: result.rows,
        itemCount: result.rows.length,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax,
        shipping,
        total,
        empty: result.rows.length === 0
      };
    } catch (error) {
      console.error('Error getting cart:', error.message);
      throw error;
    }
  }

  /**
   * Clear user's cart
   */
  async clearCart(userId) {
    try {
      const result = await db.query(
        'DELETE FROM cart_items WHERE user_id = $1',
        [userId]
      );

      return {
        success: true,
        message: `${result.rowCount} items removed from cart`,
        itemsCleared: result.rowCount
      };
    } catch (error) {
      console.error('Error clearing cart:', error.message);
      throw error;
    }
  }

  /**
   * Get cart count for user
   */
  async getCartCount(userId) {
    try {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM cart_items WHERE user_id = $1',
        [userId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting cart count:', error.message);
      throw error;
    }
  }
}

module.exports = new CartModel();
