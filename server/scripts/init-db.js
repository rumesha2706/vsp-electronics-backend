const productsModel = require('../db/products-model');

(async () => {
  try {
    console.log('Initializing database...');
    await productsModel.createTable();
    console.log('✓ Products table created or exists');
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize DB:', err.message);
    process.exit(1);
  }
})();
