# Arsitektur AI (VIMERO Command Center)

Dokumen ini menjelaskan struktur pengolahan AI dan arsitektur logika aplikasi VIMERO.

## 1. Konsep Dasar Router (AI Router)
Sistem VIMERO tidak memanggil SDK *provider* secara langsung di level komponen antarmuka. Semua panggilan dialihkan melalui abstraksi **AI Router** (seperti fungsi `generateWithAI` di `src/lib/actions`).

### Provider yang Tersedia:
- **Groq (Llama 3)**: Digunakan untuk memproduksi teks massal, *drafting* naskah (Content Factory), dan kritik AI secara instan.
- **Gemini**: Digunakan untuk riset mendalam atau strategi jangka panjang.
- **Cloudflare Workers AI**: Digunakan untuk inferensi *image generation* (Stable Diffusion) di Creative Studio karena tidak memerlukan pemeliharaan GPU sendiri.

## 2. Alur Content Factory & AI Critic
VIMERO bukan sekadar pembuat konten, melainkan **Asisten Penyunting**:
1. **Idea Bank**: Ide ditampung di tabel `content_ideas`.
2. **Drafting**: Ide dikonversi menjadi naskah mentah (`contents`).
3. **AI Critic (Evaluasi)**: Groq mengevaluasi naskah dan mengembalikan JSON berisi skor, ulasan, serta peringatan (*Claim Warnings*).
4. **Logika Threshold (Skor >= 85)**:
   - Jika `ai_score >= 85`, naskah langsung mendapatkan status `approved_recommended` (otomatis disetujui).
   - Jika `ai_score < 85`, naskah berstatus `needs_improvement` dan memaksa *editor* manusia untuk melakukan **Manual Revision**.
5. **Smart Highlighter**: Menggunakan *regex* untuk menandai kutipan spesifik di naskah asli (*Hook* atau *Body*) yang disorot oleh AI Critic.

## 3. Alur Kalender Konten (Scheduler)
Menggunakan pendekatan *Kanban* (2 Kolom):
- **Antrean (Queue)**: Konten berstatus `approved` namun belum memiliki `scheduled_at`.
- **Terjadwal (Upcoming)**: Konten berstatus `scheduled` yang telah diberi *timestamp* dan spesifikasi platform tujuan.

## 4. Standarisasi Antarmuka (UI/UX)
VIMERO menggunakan **PageContainer** (`src/components/dashboard/page-container.tsx`) sebagai *wrapper* utama untuk:
- Konsistensi latar belakang (Ambient Glow / Glassmorphism).
- Standarisasi ukuran *header* (Judul & Deskripsi).
- Pengalaman transisi yang halus di *Next.js 15 App Router*.
- Gaya futuristik, modern, dan tidak terlihat seperti *spreadsheet* konvensional.
