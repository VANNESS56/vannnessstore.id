-- Add SMM related columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS smm_service_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'local'; -- 'local' or 'buzzerpanel'
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_qty INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_qty INTEGER DEFAULT 10000;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id TEXT;

-- Index for service identification
CREATE INDEX IF NOT EXISTS idx_products_smm_service_id ON products(smm_service_id);
CREATE INDEX IF NOT EXISTS idx_products_provider ON products(provider);

-- Add SMM related columns to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS smm_target TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS smm_qty INTEGER;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS smm_order_id TEXT;
