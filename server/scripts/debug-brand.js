const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../db');
const productsModel = require('../db/products-model');

async function debugBrand() {
    try {
        console.log('Testing getAll with brand="acebott"...');
        const products = await productsModel.getAll({ brand: 'acebott', limit: 10 });
        console.log(`Found ${products.length} products.`);
        if (products.length > 0) {
            console.log('Sample product:', products[0].name, '| Brand:', products[0].brand);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

debugBrand();
