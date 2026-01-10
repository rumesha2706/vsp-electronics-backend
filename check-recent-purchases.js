const { getRecentPurchaseCount, getAll } = require('./server/db/products-model');
const db = require('./server/db');

async function checkRecentPurchases() {
    try {
        console.log('--- Checking Recent Purchase Counts ---');

        // Get all products to verify
        const products = await getAll({ limit: 10 });
        console.log(`Found ${products.length} products to check.`);

        for (const product of products) {
            const count = await getRecentPurchaseCount(product.id);
            console.log(`Product ID ${product.id} (${product.name}): ${count} recent purchases`);
        }

        // Check specific product 60 if available
        const specificId = 60;
        const count60 = await getRecentPurchaseCount(specificId);
        console.log(`\nSpecific Check for Product ID ${specificId}: ${count60} recent purchases`);

        // Check if any orders exist at all
        const orderRes = await db.query('SELECT COUNT(*) as count FROM orders');
        console.log(`\nTotal Orders in DB: ${orderRes.rows[0].count}`);

        // Check orders in last 30 days
        const recentOrdersRes = await db.query("SELECT COUNT(*) as count FROM orders WHERE created_at > NOW() - INTERVAL '30 days'");
        console.log(`Total Orders in Last 30 Days: ${recentOrdersRes.rows[0].count}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkRecentPurchases();
