-- Phase 7: Content Calendar Migration

-- 1. Tambahkan kolom penjadwalan ke tabel contents
ALTER TABLE public.contents 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS platform TEXT;
