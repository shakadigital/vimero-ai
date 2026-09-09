'use client'

import { useState } from 'react'
import {
  X,
  Copy,
  Check,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Music,
  Calendar,
  Clock,
  Sparkles,
  Share2,
  ExternalLink,
  Volume2
} from 'lucide-react'

export interface PostContentData {
  id: string
  title: string
  hook: string | null
  body: string | null
  cta: string | null
  hashtags: string[] | null
  status: string
  platform: string | null
  scheduled_at: string | null
  external_publish_id: string | null
  imageUrl?: string | null
}

interface PostPreviewModalProps {
  content: PostContentData | null
  onClose: () => void
  businessName?: string
}

export function PostPreviewModal({ content, onClose, businessName = 'SmartPOS' }: PostPreviewModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'script' | 'audio'>('preview')

  if (!content) return null

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const fullCaption = `${content.hook ? content.hook + '\n\n' : ''}${content.body || ''}\n\n${content.cta ? content.cta + '\n\n' : ''}${content.hashtags?.join(' ') || ''}`

  const scheduledDate = content.scheduled_at ? new Date(content.scheduled_at) : null
  const dateStr = scheduledDate
    ? scheduledDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    : 'Belum ditentukan'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#111326] border border-[#262a56] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23274e] bg-[#151833]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Pratinjau Hasil Penayangan</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  {content.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Kanal Target: {content.platform || 'Instagram'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (2 Columns) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* KOLOM KIRI (Mockup Postingan Layar HP / Media Sosial) - 5 Kolom */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-2xl bg-[#090b16] border border-[#2b305f] shadow-xl overflow-hidden flex flex-col">
              
              {/* Instagram Profile Header */}
              <div className="flex items-center justify-between p-3 border-b border-[#202449] bg-[#12152d]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                    {businessName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{businessName.toLowerCase()}</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white">✓</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Postingan Terbit</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">•••</span>
              </div>

              {/* Visual Image Media */}
              <div className="aspect-square relative bg-gradient-to-br from-[#1a1e44] to-[#121429] flex items-center justify-center overflow-hidden border-b border-[#202449]">
                {content.imageUrl ? (
                  <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto shadow-inner">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-white leading-snug px-4">
                      {content.hook || content.title}
                    </p>
                    <span className="text-[10px] text-primary bg-primary/10 px-2.5 py-1 rounded-full inline-block border border-primary/20">
                      Visual Banner SmartPOS
                    </span>
                  </div>
                )}
              </div>

              {/* Post Action Icons (Like, Comment, Share) */}
              <div className="p-3 bg-[#12152d] space-y-2">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                    <MessageCircle className="h-4 w-4 text-slate-300" />
                    <Send className="h-4 w-4 text-slate-300" />
                  </div>
                  <Bookmark className="h-4 w-4 text-slate-300" />
                </div>
                <p className="text-[11px] font-bold text-slate-200">1.428 suka</p>

                {/* Caption View */}
                <div className="text-xs space-y-1 text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-1">
                  <p>
                    <span className="font-bold text-white mr-1.5">{businessName.toLowerCase()}</span>
                    {content.hook && <span className="font-semibold text-white block mb-1">{content.hook}</span>}
                  </p>
                  <p className="text-slate-300 text-[11px] whitespace-pre-line">{content.body}</p>
                  {content.cta && (
                    <p className="text-primary font-semibold text-[11px] pt-1">👉 {content.cta}</p>
                  )}
                  {content.hashtags && content.hashtags.length > 0 && (
                    <p className="text-blue-400 text-[10px] pt-1 leading-normal">
                      {content.hashtags.map((h, i) => (
                        <span key={i} className="mr-1">{h}</span>
                      ))}
                    </p>
                  )}
                </div>

                {/* Audio Track Indicator */}
                <div className="pt-2 border-t border-[#202449] flex items-center gap-2 text-[10px] text-slate-400">
                  <Music className="h-3 w-3 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="truncate">Audio Asli: {businessName} • Suara Trending Bisnis</span>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (Rincian Naskah & Panduan Audio) - 7 Kolom */}
          <div className="lg:col-span-6 space-y-4">
            {/* Tab Nav */}
            <div className="flex border-b border-[#23274e] gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'preview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                1. Naskah & Deskripsi
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'audio'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                2. Format Audio & Video
              </button>
              <button
                onClick={() => setActiveTab('script')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'script'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                3. Detail Distribusi
              </button>
            </div>

            {/* TAB 1: NASKAH & CAPTION */}
            {activeTab === 'preview' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Judul Konten */}
                <div className="p-3 rounded-xl bg-[#171a35] border border-[#262a56]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Judul Konten</span>
                    <button
                      onClick={() => handleCopy(content.title, 'title')}
                      className="text-[10px] text-primary hover:text-white flex items-center gap-1 font-semibold"
                    >
                      {copied === 'title' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copied === 'title' ? 'Tersalin' : 'Salin Judul'}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-white">{content.title}</p>
                </div>

                {/* Hook (Kait Pembuka) */}
                {content.hook && (
                  <div className="p-3 rounded-xl bg-[#171a35] border border-[#262a56]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Hook (3 Detik Pertama)</span>
                      <button
                        onClick={() => handleCopy(content.hook || '', 'hook')}
                        className="text-[10px] text-primary hover:text-white flex items-center gap-1 font-semibold"
                      >
                        {copied === 'hook' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copied === 'hook' ? 'Tersalin' : 'Salin Hook'}
                      </button>
                    </div>
                    <p className="text-xs font-medium text-slate-200">{content.hook}</p>
                  </div>
                )}

                {/* Body / Deskripsi Lengkap */}
                <div className="p-3 rounded-xl bg-[#171a35] border border-[#262a56]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deskripsi Lengkap (Body & CTA)</span>
                    <button
                      onClick={() => handleCopy(content.body || '', 'body')}
                      className="text-[10px] text-primary hover:text-white flex items-center gap-1 font-semibold"
                    >
                      {copied === 'body' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copied === 'body' ? 'Tersalin' : 'Salin Body'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{content.body}</p>
                  {content.cta && (
                    <div className="mt-2 pt-2 border-t border-[#23274e] text-xs text-emerald-400 font-medium">
                      CTA: {content.cta}
                    </div>
                  )}
                </div>

                {/* Tombol Salin Seluruh Caption */}
                <button
                  onClick={() => handleCopy(fullCaption, 'full')}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                  {copied === 'full' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'full' ? 'Seluruh Caption Berhasil Disalin!' : 'Salin Seluruh Caption Postingan'}
                </button>
              </div>
            )}

            {/* TAB 2: FORMAT AUDIO & VIDEO */}
            {activeTab === 'audio' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-[#171a35] border border-[#262a56] space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <Volume2 className="h-4 w-4" />
                    Status Audio Saat Ini
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Konten ini dipublikasikan dalam format **Postingan Feed Media Sosial** (Teks + Visual).
                  </p>
                  <p className="text-xs text-muted-foreground">
                    File rekaman audio fisik (MP3) belum digenerasikan secara otomatis.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#171a35] border border-[#262a56] space-y-2.5">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Music className="h-4 w-4 text-emerald-400" />
                    Cara Mengubah Menjadi Audio/Video Reels & TikTok:
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li><strong className="text-white">Naskah Voiceover:</strong> Gunakan teks <em>Hook</em> dan <em>Body</em> di Tab 1 sebagai naskah bicara Anda (durasi ~30-45 detik).</li>
                    <li><strong className="text-white">Text-to-Speech (TTS):</strong> Salin naskah ke fitur suara otomatis di TikTok/Instagram Reels.</li>
                    <li><strong className="text-white">Musik Latar (BGM):</strong> Pasangkan dengan lagu bertema <em>Lofi / Tech / Ambient Upbeat</em> yang sedang trending saat posting.</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs text-primary font-medium">
                  💡 <strong>Fase Selanjutnya:</strong> Kita akan mengintegrasikan modul Video & Audio Generator otomatis (Text-to-Speech & Video AI)!
                </div>
              </div>
            )}

            {/* TAB 3: DETAIL DISTRIBUSI */}
            {activeTab === 'script' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3.5 rounded-xl bg-[#171a35] border border-[#262a56] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Waktu Penayangan:</span>
                    <span className="font-bold text-white">{dateStr}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status Distribusi:</span>
                    <span className="font-bold text-emerald-400">PUBLISHED (Sudah Tayang)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Kanal Target:</span>
                    <span className="font-bold text-white">{content.platform || 'Instagram'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ID Dispatcher:</span>
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                      {content.external_publish_id || 'buf-live-001'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#23274e] bg-[#151833] flex items-center justify-between text-xs text-muted-foreground">
          <span>VIMERO Content Engine v1.0.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#20254e] hover:bg-[#282e60] text-white font-medium transition-colors"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  )
}
