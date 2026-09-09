-- Phase 9: Video Audio Studio

-- 1. Alter tabel contents
ALTER TABLE public.contents 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS voice_persona TEXT,
ADD COLUMN IF NOT EXISTS subtitle_data JSONB;

-- 2. Buat tabel video_audio_projects
CREATE TABLE public.video_audio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.contents(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'audio', 'video'
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  result_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_video_audio_projects_updated_at
BEFORE UPDATE ON public.video_audio_projects
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. RLS Policies
ALTER TABLE public.video_audio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view video audio projects" ON public.video_audio_projects FOR SELECT USING (is_business_member(business_id));
CREATE POLICY "Members can insert video audio projects" ON public.video_audio_projects FOR INSERT WITH CHECK (is_business_member(business_id));
CREATE POLICY "Members can update video audio projects" ON public.video_audio_projects FOR UPDATE USING (is_business_member(business_id));
CREATE POLICY "Members can delete video audio projects" ON public.video_audio_projects FOR DELETE USING (is_business_member(business_id));
