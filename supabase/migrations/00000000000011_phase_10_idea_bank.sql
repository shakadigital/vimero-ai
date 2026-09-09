-- Phase 10: Idea Bank

-- 1. Create content_idea_bank table
CREATE TABLE public.content_idea_bank (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS Policies
ALTER TABLE public.content_idea_bank ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Authenticated users can view idea bank" 
ON public.content_idea_bank FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow insert/update/delete only for service role (admin/scripts)
-- Because this is a static template bank.
