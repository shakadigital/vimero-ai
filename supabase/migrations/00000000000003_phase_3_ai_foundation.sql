-- Phase 3: AI Foundation Migration
-- Menyiapkan tabel untuk pelacakan penggunaan token AI

CREATE TABLE public.ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- e.g., 'gemini', 'groq', 'cloudflare'
  model TEXT NOT NULL,    -- e.g., 'gemini-1.5-pro', 'llama3-70b-8192'
  agent_type TEXT NOT NULL, -- e.g., 'BUSINESS_STRATEGIST', 'COPYWRITER'
  prompt_tokens INTEGER DEFAULT 0 NOT NULL,
  completion_tokens INTEGER DEFAULT 0 NOT NULL,
  total_tokens INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- AI Usage Policies (hanya select, insert dilakukan oleh server secara aman)
CREATE POLICY "Members can view ai usage" 
ON public.ai_usage FOR SELECT USING (is_business_member(business_id));

-- Catatan: INSERT dilakukan menggunakan Service Role Key / server-side logic sehingga tidak butuh kebijakan INSERT publik.
