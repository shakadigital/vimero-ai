-- Phase 18: Research Module Migration
-- Menyiapkan tabel untuk menyimpan hasil riset pasar dan kompetitor

CREATE TABLE public.research_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('trend', 'competitor', 'audience', 'keyword')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view research_items" 
ON public.research_items FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Members can insert research_items" 
ON public.research_items FOR INSERT WITH CHECK (is_business_member(business_id));

CREATE POLICY "Members can update research_items" 
ON public.research_items FOR UPDATE USING (is_business_member(business_id));

CREATE POLICY "Members can delete research_items" 
ON public.research_items FOR DELETE USING (is_business_member(business_id));
