-- Phase 4: Content Factory Migration

-- 1. Tambahkan nilai status baru pada ENUM content_status
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'idea' BEFORE 'draft';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'generated' AFTER 'draft';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'review' AFTER 'generated';

-- 2. Buat tabel Content Pillars
CREATE TABLE public.content_pillars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_content_pillars_updated_at
BEFORE UPDATE ON public.content_pillars
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. Buat tabel Content Ideas
CREATE TABLE public.content_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  pillar_id UUID REFERENCES public.content_pillars(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, converted, discarded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_content_ideas_updated_at
BEFORE UPDATE ON public.content_ideas
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Alter tabel contents
ALTER TABLE public.contents 
ADD COLUMN IF NOT EXISTS idea_id UUID REFERENCES public.content_ideas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS hook TEXT,
ADD COLUMN IF NOT EXISTS body TEXT,
ADD COLUMN IF NOT EXISTS cta TEXT,
ADD COLUMN IF NOT EXISTS hashtags TEXT[];

-- 5. RLS Policies
ALTER TABLE public.content_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view content pillars" ON public.content_pillars FOR SELECT USING (is_business_member(business_id));
CREATE POLICY "Members can insert content pillars" ON public.content_pillars FOR INSERT WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members can update content pillars" ON public.content_pillars FOR UPDATE USING (is_business_member(business_id));
CREATE POLICY "Members can delete content pillars" ON public.content_pillars FOR DELETE USING (is_business_member(business_id));

CREATE POLICY "Members can view content ideas" ON public.content_ideas FOR SELECT USING (is_business_member(business_id));
CREATE POLICY "Members can insert content ideas" ON public.content_ideas FOR INSERT WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members can update content ideas" ON public.content_ideas FOR UPDATE USING (is_business_member(business_id));
CREATE POLICY "Members can delete content ideas" ON public.content_ideas FOR DELETE USING (is_business_member(business_id));
