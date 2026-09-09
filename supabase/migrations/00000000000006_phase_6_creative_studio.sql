-- Phase 6: Creative Studio Migration

-- 1. Buat ENUM dan Tabel untuk Media
CREATE TYPE media_type AS ENUM ('logo', 'image', 'video', 'generated_image');

CREATE TABLE public.media_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  type media_type DEFAULT 'image' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat Tabel Riwayat Generasi AI
CREATE TABLE public.generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.contents(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '1:1',
  model TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS Policies untuk Tabel
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view media assets" ON public.media_assets FOR SELECT USING (is_business_member(business_id));
CREATE POLICY "Members can insert media assets" ON public.media_assets FOR INSERT WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members can update media assets" ON public.media_assets FOR UPDATE USING (is_business_member(business_id));
CREATE POLICY "Members can delete media assets" ON public.media_assets FOR DELETE USING (is_business_member(business_id));

CREATE POLICY "Members can view generation history" ON public.generation_history FOR SELECT USING (is_business_member(business_id));
CREATE POLICY "Members can insert generation history" ON public.generation_history FOR INSERT WITH CHECK (is_business_member(business_id));

-- 4. Setup Supabase Storage Bucket untuk Media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public can view media bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can insert into media bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
