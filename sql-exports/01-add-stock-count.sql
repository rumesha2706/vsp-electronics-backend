-- Add stock_count column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0;

-- Update existing products to have default stock count (optional, but good for consistency)
UPDATE products SET stock_count = 0 WHERE stock_count IS NULL;
