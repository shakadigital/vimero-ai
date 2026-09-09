-- Hotfix: Menambahkan policy INSERT pada business_members agar trigger handle_new_business dapat berjalan.
-- Trigger menggunakan SECURITY DEFINER sehingga seharusnya berjalan tanpa masalah,
-- namun sebagai penjagaan, kita tambahkan juga kebijakan agar user bisa meng-INSERT membership untuk diri sendiri.

-- Policy: User bisa menambahkan dirinya sendiri ke bisnis
CREATE POLICY "Users can insert own membership" 
ON public.business_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);
