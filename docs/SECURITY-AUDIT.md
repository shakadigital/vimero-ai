# Audit Keamanan dan Rekomendasi Penyempurnaan Vimero AI

Tanggal audit: 14 September 2026  
Cakupan: review statis source code, Server Actions, API routes, Supabase migrations, storage, AI pipeline, dan integrasi eksternal.

## Ringkasan

Aplikasi belum siap untuk production sebagai SaaS multi-tenant. Risiko tertinggi berada pada kebocoran secret, isolasi tenant Supabase, Server Actions privileged tanpa ownership validation, endpoint test AI terbuka, stored XSS, serta tidak adanya rate limit/quota.

## Temuan Critical

### C-01 — Secret produksi berada di `.env.example`

**Lokasi:** `.env.example:1-22`  
**Dampak:** service-role Supabase, Gemini, Groq, Cloudflare/R2, dan Buffer dapat disalahgunakan untuk akses data, biaya API, atau modifikasi storage.  
**Rekomendasi:** revoke/rotate seluruh credential, hapus nilai nyata dari repository dan history Git, gunakan placeholder, serta aktifkan secret scanning CI.

### C-02 — Self-join ke bisnis lain

**Lokasi:** `supabase/migrations/00000000000009_hotfix_business_members_insert.sql:5-8`  
**Dampak:** user login dapat menambahkan dirinya ke bisnis mana pun jika mengetahui UUID.  
**Rekomendasi:** hapus policy tersebut; gunakan tabel invitation dengan token acak, expiry, email target, dan pembatasan owner/admin.

### C-03 — Service role tanpa validasi membership

**Lokasi:** `src/lib/actions/studio.ts:9-15,63-83`; `src/lib/supabase/admin.ts:5-9`  
**Dampak:** bypass RLS dan akses lintas tenant melalui Server Action.  
**Rekomendasi:** gunakan session client jika memungkinkan; jika service role diperlukan, validasi auth, membership, role, dan ownership setiap resource terlebih dahulu.

## Temuan High

- `/api/test-ai` terbuka tanpa auth/rate limit (`src/app/api/test-ai/route.ts:5-27`). Tutup di production atau batasi ke admin/development.
- Tidak ada rate limit, quota, budget, concurrency limit, dan idempotency untuk AI, TTS, image generation, publishing, dan video rendering.
- Buffer mengubah HTTP/network failure menjadi `success: true` (`src/lib/integrations/buffer.ts:78-97,145-161`). Status database dapat menyatakan publish berhasil padahal gagal.
- Stored XSS melalui `dangerouslySetInnerHTML` (`src/app/dashboard/[businessId]/contents/content-card.tsx:26-33`). Gunakan React nodes dan hindari HTML string.
- Media bucket public dan policy upload tidak tenant-aware (`supabase/migrations/00000000000006_phase_6_creative_studio.sql:38-50`). Gunakan private bucket, signed URL, dan prefix policy.

## Temuan Medium dan Low

- Validasi server minim; tambahkan Zod untuk UUID, enum platform, tanggal, URL, panjang teks, asset, dan render payload.
- Query action perlu mengikat resource ke `business_id`, tidak hanya ID resource.
- Operasi multi-step belum atomik; gunakan RPC/transaction, status transition, dan idempotency constraint.
- Render menyimpan file di `public/temp` tanpa cleanup; pindahkan ke private object storage dan retention job.
- External URL belum di-allowlist dan belum dibatasi ukuran/MIME/redirect.
- RLS belum membedakan member/admin/owner dan beberapa UPDATE policy belum memiliki `WITH CHECK`.
- Fungsi `SECURITY DEFINER` perlu `SET search_path = pg_catalog, public` dan schema-qualified references.
- Tambahkan CSP, HSTS production, `X-Content-Type-Options`, `Referrer-Policy`, dan `Permissions-Policy`.
- Gunakan `crypto.randomUUID()` untuk identifier file/artifact.

## Rencana prioritas

1. Rotate secrets dan bersihkan environment example/history.
2. Cabut self-join membership dan implementasikan authorization helper.
3. Tutup endpoint test AI.
4. Perbaiki action privileged, XSS, dan status Buffer.
5. Perketat storage/RLS serta validasi input.
6. Tambahkan quota, rate limit, queue rendering, logging biaya, dan regression test tenant isolation.

Audit ini berbasis source statis. RLS production, credential aktif, dan deployment perlu diverifikasi terpisah sebelum rilis.
