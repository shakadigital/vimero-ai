-- Phase 16: Brand Memory Expansion
-- Menambahkan kolom-kolom baru ke tabel brand_kits untuk mendukung Brand Memory AI.

ALTER TABLE public.brand_kits
ADD COLUMN target_audience TEXT,
ADD COLUMN audience_problems TEXT,
ADD COLUMN brand_personality TEXT,
ADD COLUMN writing_style TEXT,
ADD COLUMN preferred_words TEXT[] DEFAULT '{}',
ADD COLUMN forbidden_words TEXT[] DEFAULT '{}',
ADD COLUMN forbidden_phrases TEXT[] DEFAULT '{}',
ADD COLUMN content_boundaries TEXT[] DEFAULT '{}';
