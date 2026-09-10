-- Migration: Prompt Bank
-- Membuat tabel referensi untuk menyimpan data prompt dari 8500+Prompt.txt

CREATE TABLE IF NOT EXISTS public.ai_prompts_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.ai_prompts_bank ENABLE ROW LEVEL SECURITY;

-- Prompt Bank Policies
-- Publik (atau minimal authenticated user) bisa melihat prompt bank
CREATE POLICY "Anyone can view ai prompts bank" 
ON public.ai_prompts_bank FOR SELECT USING (true);

-- Insert/Update/Delete dibatasi, umumnya melalui service role atau super admin
-- Oleh karena itu, tidak perlu policy publik untuk operasi modifikasi
