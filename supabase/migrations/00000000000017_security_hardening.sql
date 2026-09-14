-- This migration is intentionally additive. Existing public objects are removed
-- from active policies and replaced with tenant-scoped policies.
DROP POLICY IF EXISTS "Users can insert own membership" ON public.business_members;

UPDATE storage.buckets
SET public = false
WHERE id = 'media';

DROP POLICY IF EXISTS "Public can view media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can insert into media bucket" ON storage.objects;

CREATE POLICY "Members can view media objects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media'
  AND EXISTS (
    SELECT 1
    FROM public.business_members bm
    WHERE bm.business_id::text = (storage.foldername(name))[1]
      AND bm.user_id = auth.uid()
  )
);

CREATE POLICY "Members can insert media objects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND EXISTS (
    SELECT 1
    FROM public.business_members bm
    WHERE bm.business_id::text = (storage.foldername(name))[1]
      AND bm.user_id = auth.uid()
  )
);

CREATE POLICY "Members can delete media objects"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND EXISTS (
    SELECT 1
    FROM public.business_members bm
    WHERE bm.business_id::text = (storage.foldername(name))[1]
      AND bm.user_id = auth.uid()
  )
);
