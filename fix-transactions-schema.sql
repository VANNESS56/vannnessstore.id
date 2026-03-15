-- ============================================
-- VANNESS STORE - Transactions Schema Update
-- Jalankan SQL ini di Supabase SQL Editor
-- Untuk memperbaiki error "user_id column not found"
-- ============================================

-- Tambah kolom user_id ke tabel transactions jika belum ada
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Index untuk mempermudah pencarian transaksi per user
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Refresh schema cache (otomatis dilakukan Supabase setelah ALTER)
