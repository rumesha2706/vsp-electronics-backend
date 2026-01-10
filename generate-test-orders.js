const db = require('./server/db');

async function generateTestOrders() {
    const client = await db.pool.connect();
    try {
        console.log('--- Generating Test Orders ---');

        // 1. Find a product ID (prefer 60, else first available)
        let productId = 60;
        const prodRes = await client.query('SELECT id, name, price FROM products WHERE id = $1', [productId]);
        let product;

        if (prodRes.rows.length > 0) {
            product = prodRes.rows[0];
        } else {
            console.log('Product 60 not found, picking first available product...');
            const fallback = await client.query('SELECT id, name, price FROM products LIMIT 1');
            if (fallback.rows.length === 0) {
                throw new Error('No products found in DB!');
            }
            product = fallback.rows[0];
            productId = product.id;
        }

        console.log(`Target Product: ID ${product.id} - ${product.name}`);

        // 2. Insert 5 orders from different users in the last week
        const userIds = [101, 102, 103, 104, 105];

        for (const userId of userIds) {
            // Create Order
            const orderRes = await client.query(`
        INSERT INTO orders (user_id, order_number, subtotal, tax, shipping, total, status, created_at)
        VALUES ($1, $2, 0, 0, 0, 0, 'completed', NOW() - INTERVAL '2 days')
        RETURNING id
      `, [userId, `TEST-ORD-${Date.now()}-${userId}`]);

            const orderId = orderRes.rows[0].id;

            // Create Order Item
            await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price_per_item, item_total)
        VALUES ($1, $2, $3, 1, $4, $4)
      `, [orderId, productId, product.name, product.price || 100]);

            console.log(`Created Order ${orderId} for User ${userId}`);
        }

        console.log('✅ Successfully generated 5 test orders.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit();
    }
}

generateTestOrders();
