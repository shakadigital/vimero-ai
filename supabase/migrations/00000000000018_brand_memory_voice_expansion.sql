-- Phase 18: Brand Memory Voice, Proof & Reel Defaults Expansion
-- Menambahkan kolom untuk fakta nyata (proof), sudut pandang (positions),
-- kata kunci pencarian, hashtag default, WPM, kata ganti, dan CTA default.

ALTER TABLE public.brand_kits
ADD COLUMN IF NOT EXISTS proof_points TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS brand_positions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS default_search_terms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS default_hashtags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS speaking_wpm INTEGER DEFAULT 165,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS cta_keyword TEXT,
ADD COLUMN IF NOT EXISTS cta_delivers TEXT;
