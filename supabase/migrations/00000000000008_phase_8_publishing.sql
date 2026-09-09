-- Phase 8: Multichannel Publishing Migration

-- Menambahkan kolom log publikasi eksternal ke tabel contents
ALTER TABLE public.contents 
ADD COLUMN IF NOT EXISTS external_publish_id TEXT,
ADD COLUMN IF NOT EXISTS publish_error TEXT;
