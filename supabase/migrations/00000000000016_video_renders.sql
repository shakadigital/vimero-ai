-- Migration untuk sistem antrean (Queue) Video Rendering

CREATE TABLE IF NOT EXISTS public.video_renders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE, -- Optional, bisa di-link ke konten tertentu
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'rendering', 'completed', 'failed'
  progress INTEGER NOT NULL DEFAULT 0, -- 0 sampai 100
  file_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.video_renders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their business video renders" ON public.video_renders;
CREATE POLICY "Users can view their business video renders"
  ON public.video_renders FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert video renders for their business" ON public.video_renders;
CREATE POLICY "Users can insert video renders for their business"
  ON public.video_renders FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their business video renders" ON public.video_renders;
CREATE POLICY "Users can update their business video renders"
  ON public.video_renders FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their business video renders" ON public.video_renders;
CREATE POLICY "Users can delete their business video renders"
  ON public.video_renders FOR DELETE
  USING (
    business_id IN (
      SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
    )
  );

-- Trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_video_renders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_video_renders_updated_at ON public.video_renders;
CREATE TRIGGER update_video_renders_updated_at
BEFORE UPDATE ON public.video_renders
FOR EACH ROW
EXECUTE FUNCTION update_video_renders_updated_at();
