-- Phase 5: AI Quality Control Migration

-- 1. Tambahkan nilai status baru pada ENUM content_status
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'ai_review' AFTER 'generated';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'approved_recommended' AFTER 'ai_review';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'needs_improvement' AFTER 'approved_recommended';

-- 2. Tambahkan kolom penilaian AI ke tabel contents
ALTER TABLE public.contents 
ADD COLUMN IF NOT EXISTS ai_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_feedback TEXT,
ADD COLUMN IF NOT EXISTS ai_claim_warnings TEXT[];
