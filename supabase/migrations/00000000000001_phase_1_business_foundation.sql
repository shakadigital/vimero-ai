-- Phase 1: Auth & Business Foundation Migration
-- Menyiapkan tabel inti dan Row Level Security (RLS)

-- 1. Profiles Table (Ekstensi dari auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. Businesses Table
CREATE TABLE public.businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. Business Members (Membatasi akses dan role)
CREATE TYPE business_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE public.business_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role business_role DEFAULT 'owner' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (business_id, user_id)
);

-- 4. Brand Kits
CREATE TABLE public.brand_kits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  font_family TEXT,
  tone_of_voice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_brand_kits_updated_at
BEFORE UPDATE ON public.brand_kits
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. Products & Services
CREATE TYPE offering_type AS ENUM ('product', 'service');

CREATE TABLE public.products_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  type offering_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_info TEXT, -- Fleksibel untuk MVP
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_products_services_updated_at
BEFORE UPDATE ON public.products_services
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Business Goals
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'archived');

CREATE TABLE public.business_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status goal_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_business_goals_updated_at
BEFORE UPDATE ON public.business_goals
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_goals ENABLE ROW LEVEL SECURITY;

-- Profiles: Pengguna hanya dapat melihat dan mengubah profil mereka sendiri
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Business Members: Pengguna dapat melihat keanggotaannya
CREATE POLICY "Users can view their business memberships" 
ON public.business_members FOR SELECT USING (auth.uid() = user_id);

-- Helper function untuk mengecek apakah user adalah anggota bisnis
CREATE OR REPLACE FUNCTION is_business_member(check_business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = check_business_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Businesses: Hanya member yang dapat melihat dan mengubah bisnis tersebut
CREATE POLICY "Members can view business" 
ON public.businesses FOR SELECT USING (is_business_member(id));

CREATE POLICY "Members can update business" 
ON public.businesses FOR UPDATE USING (is_business_member(id));

-- Siapapun yang terautentikasi bisa membuat bisnis (akan ditambahkan otomatis ke members di aplikasi)
CREATE POLICY "Authenticated users can create business" 
ON public.businesses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Brand Kits
CREATE POLICY "Members can view brand kit" 
ON public.brand_kits FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Members can insert brand kit" 
ON public.brand_kits FOR INSERT WITH CHECK (is_business_member(business_id));

CREATE POLICY "Members can update brand kit" 
ON public.brand_kits FOR UPDATE USING (is_business_member(business_id));

-- Products & Services
CREATE POLICY "Members can view products and services" 
ON public.products_services FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Members can insert products and services" 
ON public.products_services FOR INSERT WITH CHECK (is_business_member(business_id));

CREATE POLICY "Members can update products and services" 
ON public.products_services FOR UPDATE USING (is_business_member(business_id));

CREATE POLICY "Members can delete products and services" 
ON public.products_services FOR DELETE USING (is_business_member(business_id));

-- Business Goals
CREATE POLICY "Members can view goals" 
ON public.business_goals FOR SELECT USING (is_business_member(business_id));

CREATE POLICY "Members can insert goals" 
ON public.business_goals FOR INSERT WITH CHECK (is_business_member(business_id));

CREATE POLICY "Members can update goals" 
ON public.business_goals FOR UPDATE USING (is_business_member(business_id));

CREATE POLICY "Members can delete goals" 
ON public.business_goals FOR DELETE USING (is_business_member(business_id));

-- Trigger otomatis membuat business_member saat bisnis baru dibuat
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if auth.uid() is available (it might be null if created by service role)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'owner');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_business_created
AFTER INSERT ON public.businesses
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_business();
