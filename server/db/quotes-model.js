/**
 * Quotes Model
 * Manages Request for Quote (RFQ) persistence
 */

const db = require('./index.js');

class QuotesModel {
    /**
     * Create quotes tables
     */
    async createTables() {
        try {
            // Quotes Table
            await db.query(`
        CREATE TABLE IF NOT EXISTS quotes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          status VARCHAR(50) DEFAULT 'pending', -- pending, responded, rejected
          email VARCHAR(100), -- For guest quotes or contact backup
          phone VARCHAR(20),
          message TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

            // Quote Items Table
            await db.query(`
        CREATE TABLE IF NOT EXISTS quote_items (
          id SERIAL PRIMARY KEY,
          quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id),
          quantity INTEGER NOT NULL DEFAULT 1,
          price_expected DECIMAL(10, 2), -- User's target price?
          notes VARCHAR(500),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

            return true;
        } catch (error) {
            console.error('Error creating quotes tables:', error.message);
            throw error;
        }
    }

    /**
     * Create a new quote request
     */
    async createQuote(userId, items, contactInfo) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Create Quote Header
            const quoteRes = await client.query(
                `INSERT INTO quotes (user_id, status, email, phone, message)
         VALUES ($1, 'pending', $2, $3, $4)
         RETURNING *`,
                [userId, contactInfo.email, contactInfo.phone, contactInfo.message]
            );
            const quoteId = quoteRes.rows[0].id;

            // Insert Items
            for (const item of items) {
                await client.query(
                    `INSERT INTO quote_items (quote_id, product_id, quantity, notes)
           VALUES ($1, $2, $3, $4)`,
                    [quoteId, item.productId, item.quantity, item.notes || '']
                );
            }

            await client.query('COMMIT');

            return {
                success: true,
                message: 'Quote created successfully',
                quote: quoteRes.rows[0]
            };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating quote:', error.message);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get user's quotes
     */
    async getUserQuotes(userId) {
        try {
            const result = await db.query(
                `SELECT * FROM quotes WHERE user_id = $1 ORDER BY created_at DESC`,
                [userId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting user quotes:', error.message);
            throw error;
        }
    }

    /**
     * Get single quote with items
     */
    async getQuote(quoteId) {
        try {
            const quoteRes = await db.query('SELECT * FROM quotes WHERE id = $1', [quoteId]);
            if (quoteRes.rows.length === 0) return null;

            const itemsRes = await db.query(
                `SELECT qi.*, p.name, p.image 
         FROM quote_items qi
         JOIN products p ON qi.product_id = p.id
         WHERE qi.quote_id = $1`,
                [quoteId]
            );

            return {
                ...quoteRes.rows[0],
                items: itemsRes.rows
            };
        } catch (error) {
            console.error('Error getting quote:', error.message);
            throw error;
        }
    }

    /**
     * Get all quotes (Admin)
     */
    async getAllQuotes() {
        try {
            const result = await db.query('SELECT * FROM quotes ORDER BY created_at DESC');
            return result.rows;
        } catch (error) {
            console.error('Error getting all quotes:', error.message);
            throw error;
        }
    }
}

module.exports = new QuotesModel();
