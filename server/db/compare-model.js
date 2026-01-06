/**
 * Compare Model
 * Manages user's compare list (max 4 items typically)
 */

const db = require('./index.js');

class CompareModel {
    /**
     * Create compare table
     */
    async createTable() {
        try {
            await db.query(`
        CREATE TABLE IF NOT EXISTS compares (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          UNIQUE(user_id, product_id)
        )
      `);

            console.log('CompareModel - Table check/creation successful');
            return true;
        } catch (error) {
            console.error('Error creating compares table:', error.message);
            throw error;
        }
    }

    /**
     * Add item to compare
     */
    async addToCompare(userId, productId) {
        try {
            // Limit check (optional, but good practice)
            const countRes = await db.query('SELECT COUNT(*) FROM compares WHERE user_id = $1', [userId]);
            const count = parseInt(countRes.rows[0].count);

            if (count >= 4) {
                // Option 1: Error
                // throw new Error('Compare list full (max 4 items)');
                // Option 2: Remove oldest
                await db.query(`
          DELETE FROM compares 
          WHERE id IN (
            SELECT id FROM compares WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1
          )
        `, [userId]);
            }

            const result = await db.query(
                `INSERT INTO compares (user_id, product_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, product_id) DO NOTHING
         RETURNING *`,
                [userId, productId]
            );

            return {
                success: true,
                message: 'Item added to compare',
                compareItem: result.rows[0]
            };
        } catch (error) {
            console.error('Error adding to compare:', error.message);
            throw error;
        }
    }

    /**
     * Remove item from compare
     */
    async removeFromCompare(userId, productId) {
        try {
            const result = await db.query(
                'DELETE FROM compares WHERE user_id = $1 AND product_id = $2 RETURNING *',
                [userId, productId]
            );

            return {
                success: true,
                message: 'Item removed from compare',
                deletedItem: result.rows[0]
            };
        } catch (error) {
            console.error('Error removing from compare:', error.message);
            throw error;
        }
    }

    /**
     * Get user's compare list with product details
     */
    async getCompareList(userId) {
        try {
            console.log('CompareModel.getCompareList - Querying for userId:', userId);
            const result = await db.query(
                `SELECT 
           c.id,
           c.user_id,
           c.product_id,
           c.created_at,
           p.name,
           p.image,
           p.category,
           p.brand,
           p.price,
           p.in_stock,
           p.description,
           p.metadata
         FROM compares c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC`,
                [userId]
            );

            return {
                items: result.rows,
                count: result.rows.length
            };
        } catch (error) {
            console.error('Error getting compare list:', error.message);
            throw error;
        }
    }

    /**
     * Clear compare list
     */
    async clearCompare(userId) {
        try {
            await db.query('DELETE FROM compares WHERE user_id = $1', [userId]);
            return { success: true, message: 'Compare list cleared' };
        } catch (error) {
            console.error('Error clearing compare:', error.message);
            throw error;
        }
    }
}

module.exports = new CompareModel();
