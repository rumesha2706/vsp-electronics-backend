/**
 * Wishlist Model
 * Manages user's wishlist items
 */

const db = require('./index.js');

class WishlistModel {
  /**
   * Create wishlist table
   */
  async createTable() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS wishlists (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          UNIQUE(user_id, product_id)
        )
      `);

      // Index for faster lookups
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id)
      `);

      return true;
    } catch (error) {
      console.error('Error creating wishlists table:', error.message);
      throw error;
    }
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(userId, productId) {
    try {
      const result = await db.query(
        `INSERT INTO wishlists (user_id, product_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, product_id) DO NOTHING
         RETURNING *`,
        [userId, productId]
      );

      return {
        success: true,
        message: 'Item added to wishlist',
        wishlistItem: result.rows[0]
      };
    } catch (error) {
      console.error('Error adding to wishlist:', error.message);
      throw error;
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(userId, productId) {
    try {
      const result = await db.query(
        'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2 RETURNING *',
        [userId, productId]
      );

      if (result.rows.length === 0) {
        throw new Error('Wishlist item not found');
      }

      return {
        success: true,
        message: 'Item removed from wishlist',
        deletedItem: result.rows[0]
      };
    } catch (error) {
      console.error('Error removing from wishlist:', error.message);
      throw error;
    }
  }

  /**
   * Get user's wishlist with product details
   */
  async getWishlist(userId) {
    try {
      const result = await db.query(
        `SELECT 
           w.id,
           w.user_id,
           w.product_id,
           w.created_at,
           p.name,
           p.image,
           p.category,
           p.brand,
           p.price,
           p.in_stock,
           p.description
         FROM wishlists w
         JOIN products p ON w.product_id = p.id
         WHERE w.user_id = $1
         ORDER BY w.created_at DESC`,
        [userId]
      );

      return {
        items: result.rows,
        count: result.rows.length
      };
    } catch (error) {
      console.error('Error getting wishlist:', error.message);
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(userId, productId) {
    try {
      const result = await db.query(
        'SELECT 1 FROM wishlists WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking wishlist:', error.message);
      return false;
    }
  }
}

module.exports = new WishlistModel();
