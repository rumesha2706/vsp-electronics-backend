-- Set default stock for existing products so they are available
UPDATE products 
SET stock_count = 100, in_stock = true 
WHERE stock_count = 0 OR stock_count IS NULL;
