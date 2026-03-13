-- ============================================
-- VANNESS STORE - Auto Delivery System Tables
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- Tambah kolom auto_delivery ke tabel products
ALTER TABLE products ADD COLUMN IF NOT EXISTS auto_delivery BOOLEAN NOT NULL DEFAULT false;

-- Tabel stok produk digital
CREATE TABLE IF NOT EXISTS product_stock (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    is_sold BOOLEAN NOT NULL DEFAULT false,
    sold_to TEXT,
    sold_at TIMESTAMPTZ,
    order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambah kolom delivered_data ke tabel transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS delivered_data TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'manual';

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_product_stock_product_id ON product_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_is_sold ON product_stock(is_sold);
CREATE INDEX IF NOT EXISTS idx_product_stock_order_id ON product_stock(order_id);
