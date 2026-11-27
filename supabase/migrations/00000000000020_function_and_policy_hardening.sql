-- 1) Fungsi SECURITY DEFINER wajib punya search_path tetap agar tidak bisa dibajak
--    lewat objek dengan nama sama di schema lain.
ALTER FUNCTION public.is_business_member(uuid)     SET search_path = pg_catalog, public;
ALTER FUNCTION public.handle_new_business()        SET search_path = pg_catalog, public;
ALTER FUNCTION public.log_business_goal_changes()  SET search_path = pg_catalog, public;

-- 2) Policy UPDATE tanpa WITH CHECK memungkinkan baris "dipindahkan" ke business_id lain.
--    Tambahkan WITH CHECK yang sama dengan USING.
ALTER POLICY "Members can update business" ON public.businesses
  USING (is_business_member(id)) WITH CHECK (is_business_member(id));

ALTER POLICY "Members can update brand kit" ON public.brand_kits
  USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

ALTER POLICY "Members can update products and services" ON public.products_services
  USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

ALTER POLICY "Members can update goals" ON public.business_goals
  USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

ALTER POLICY "Members can update contents" ON public.contents
  USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

ALTER POLICY "Members can update content pillars" ON public.content_pillars
  USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

ALTER POLICY "Members can update content ideas" ON public.content_ideas
  USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

ALTER POLICY "Members can update media assets" ON public.media_assets
  USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

ALTER POLICY "Members can update video audio projects" ON public.video_audio_projects
  USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

ALTER POLICY "Members can update research_items" ON public.research_items
  USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

ALTER POLICY "Users can update their business video renders" ON public.video_renders
  USING (business_id IN (SELECT business_id FROM public.business_members WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT business_id FROM public.business_members WHERE user_id = auth.uid()));
