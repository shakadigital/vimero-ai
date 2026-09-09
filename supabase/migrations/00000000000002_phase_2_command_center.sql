-- Phase 2: Command Center Migration
-- Menyiapkan tabel untuk konten, aktivitas, dan analitik beserta RLS

-- 1. Contents Table
CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published');

CREATE TABLE public.contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status content_status DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_contents_updated_at
BEFORE UPDATE ON public.contents
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. Audit Logs Table (Aktivitas Terbaru)
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- e.g., 'content', 'goal', 'brand_kit'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Analytics Daily Table (KPI Dasar)
CREATE TABLE public.analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  metric_name TEXT NOT NULL, -- e.g., 'followers', 'reach', 'engagement'
  metric_value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(business_id, date, metric_name)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;

-- Contents Policies
CREATE POLICY "Members can view contents" 
ON public.contents FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Members can insert contents" 
ON public.contents FOR INSERT WITH CHECK (is_business_member(business_id));

CREATE POLICY "Members can update contents" 
ON public.contents FOR UPDATE USING (is_business_member(business_id));

CREATE POLICY "Members can delete contents" 
ON public.contents FOR DELETE USING (is_business_member(business_id));

-- Audit Logs Policies (hanya insert & select)
CREATE POLICY "Members can view audit logs" 
ON public.audit_logs FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Members can insert audit logs" 
ON public.audit_logs FOR INSERT WITH CHECK (is_business_member(business_id));

-- Analytics Policies (hanya select, insert dilakukan oleh system/cron)
CREATE POLICY "Members can view analytics" 
ON public.analytics_daily FOR SELECT USING (is_business_member(business_id));

-- Function untuk mencatat log otomatis setiap ada perubahan goal
CREATE OR REPLACE FUNCTION log_business_goal_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (business_id, user_id, action, entity_type)
    VALUES (NEW.business_id, auth.uid(), 'Created new goal: ' || NEW.title, 'goal');
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.audit_logs (business_id, user_id, action, entity_type)
      VALUES (NEW.business_id, auth.uid(), 'Updated goal status to ' || NEW.status, 'goal');
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER goals_audit
AFTER INSERT OR UPDATE ON public.business_goals
FOR EACH ROW EXECUTE PROCEDURE log_business_goal_changes();
