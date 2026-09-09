-- Phase 17: Buffer Integration
-- Menambahkan kolom buffer_update_id untuk melacak postingan yang sudah dijadwalkan ke Buffer

ALTER TABLE public.contents
ADD COLUMN IF NOT EXISTS buffer_update_id TEXT;
