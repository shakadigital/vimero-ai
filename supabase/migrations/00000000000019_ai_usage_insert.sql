-- Pencatatan ai_usage dilakukan dengan klien sesi pengguna (src/lib/ai/registry.ts).
-- Sebelumnya tabel ini hanya punya policy SELECT, sehingga setiap INSERT ditolak RLS
-- dan Cost Controller / kuota harian tidak pernah melihat data.
-- Policy ini membatasi INSERT ke anggota bisnis yang bersangkutan.
CREATE POLICY "Members can insert ai usage"
ON public.ai_usage FOR INSERT
WITH CHECK (is_business_member(business_id));
