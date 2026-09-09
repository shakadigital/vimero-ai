'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScheduleFormProps {
  businessId: string
  contentId: string
  title: string
  action: (formData: FormData) => Promise<void>
}

export function ScheduleForm({ businessId, contentId, title, action }: ScheduleFormProps) {
  // Hitung tanggal hari ini, besok, dan lusa
  const now = new Date()
  
  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const todayStr = formatDateForInput(now)
  
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = formatDateForInput(tomorrow)

  const dayAfterTomorrow = new Date(now)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  const dayAfterStr = formatDateForInput(dayAfterTomorrow)

  // Default: Besok jam 19:00 (Prime time engagement)
  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr)
  const [selectedTime, setSelectedTime] = useState<string>('19:00')
  const [platform, setPlatform] = useState<string>('Instagram')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Quick preset jam tayang populer
  const timePresets = [
    { label: '09:00 Pagi', value: '09:00' },
    { label: '12:30 Siang', value: '12:30' },
    { label: '17:00 Sore', value: '17:00' },
    { label: '19:30 Malam', value: '19:30' },
  ]

  // Combined DateTime string: "YYYY-MM-DDTHH:mm:00"
  const combinedDateTime = `${selectedDate}T${selectedTime}:00`

  // Format tanggal ramah untuk preview
  const previewDate = new Date(`${selectedDate}T${selectedTime}:00`)
  const readablePreview = isNaN(previewDate.getTime())
    ? 'Pilih tanggal & jam yang valid'
    : previewDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) + `, pukul ${selectedTime} WIB`

  return (
    <div className="p-4 rounded-xl bg-[#171a35] border border-[#262a56] shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2 py-0.5 rounded-full">
            Siap Dijadwalkan
          </span>
          <h3 className="font-bold text-sm text-white mt-1 line-clamp-2">{title}</h3>
        </div>
      </div>

      <form
        action={async (formData) => {
          setIsSubmitting(true)
          try {
            await action(formData)
          } finally {
            setIsSubmitting(false)
          }
        }}
        className="space-y-4"
      >
        <input type="hidden" name="date" value={combinedDateTime} />

        {/* 1. Pemilih Tanggal */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            Pilih Tanggal Tayang
          </label>

          {/* Quick Date Presets */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`py-1.5 px-2 text-xs rounded-lg font-medium transition-all ${
                selectedDate === todayStr
                  ? 'bg-primary text-white font-bold shadow-sm'
                  : 'bg-[#20254e] text-slate-300 hover:bg-[#282e60]'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`py-1.5 px-2 text-xs rounded-lg font-medium transition-all ${
                selectedDate === tomorrowStr
                  ? 'bg-primary text-white font-bold shadow-sm'
                  : 'bg-[#20254e] text-slate-300 hover:bg-[#282e60]'
              }`}
            >
              Besok
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(dayAfterStr)}
              className={`py-1.5 px-2 text-xs rounded-lg font-medium transition-all ${
                selectedDate === dayAfterStr
                  ? 'bg-primary text-white font-bold shadow-sm'
                  : 'bg-[#20254e] text-slate-300 hover:bg-[#282e60]'
              }`}
            >
              Lusa
            </button>
          </div>

          {/* Date Picker Input */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-[#2b305f] bg-[#121429] px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
              required
            />
          </div>
        </div>

        {/* 2. Pemilih Jam */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Pilih Jam Tayang
          </label>

          {/* Quick Time Presets */}
          <div className="grid grid-cols-2 gap-1.5">
            {timePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setSelectedTime(preset.value)}
                className={`py-1.5 px-2 text-xs rounded-lg transition-all ${
                  selectedTime === preset.value
                    ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                    : 'bg-[#20254e] text-slate-300 hover:bg-[#282e60]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Time Picker */}
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full rounded-lg border border-[#2b305f] bg-[#121429] px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
            required
          />
        </div>

        {/* 3. Kanal Publikasi */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5 text-primary" />
            Kanal Media Sosial
          </label>
          <select
            name="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-[#2b305f] bg-[#121429] px-3 py-2 text-xs text-white focus:outline-none focus:border-primary cursor-pointer"
            required
          >
            <option value="Instagram">📷 Instagram (Feed & Reels)</option>
            <option value="TikTok">🎵 TikTok</option>
            <option value="LinkedIn">💼 LinkedIn</option>
            <option value="Twitter/X">🐦 Twitter / X</option>
            <option value="Facebook">📘 Facebook</option>
          </select>
        </div>

        {/* 4. Rangkuman Jadwal */}
        <div className="rounded-lg bg-[#111326] border border-[#23274e] p-2.5 text-[11px] text-slate-300 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <div className="truncate">
            Jadwal: <span className="text-white font-semibold">{readablePreview}</span>
          </div>
        </div>

        {/* 5. Tombol Submit */}
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-md shadow-primary/25"
        >
          {isSubmitting ? (
            'Menjadwalkan...'
          ) : (
            <>
              <CalendarIcon className="h-4 w-4" />
              Simpan ke Kalender
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
