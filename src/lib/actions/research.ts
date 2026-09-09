'use server'

import { createClient } from '@/lib/supabase/server'
import { runResearcher } from '@/lib/ai/agents/researcher'
import { revalidatePath } from 'next/cache'

export async function generateResearch(businessId: string, researchType: 'trend' | 'competitor' | 'audience' | 'keyword', formData?: FormData) {
  const supabase = await createClient()

  try {
    const result = await runResearcher(businessId, researchType)

    // Simpan hasil ke database
    const insertData = result.items.map(item => ({
      business_id: businessId,
      type: researchType,
      title: item.title,
      content: item.content
    }))

    const { error } = await supabase.from('research_items').insert(insertData)
    
    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/${businessId}/research`)
  } catch (error: any) {
    throw new Error(error.message || "Gagal menghasilkan riset")
  }
}

export async function convertToIdea(businessId: string, title: string, content: string) {
  const supabase = await createClient()

  try {
    // Ambil pilar pertama sebagai default (atau buat pilar 'Uncategorized' jika tidak ada)
    let { data: pillars } = await supabase.from('content_pillars').select('id').eq('business_id', businessId).limit(1)
    
    let pillarId = pillars?.[0]?.id

    if (!pillarId) {
      const { data: newPillar } = await supabase.from('content_pillars').insert({
        business_id: businessId,
        name: 'Hasil Riset',
        description: 'Ide konten yang dihasilkan dari modul riset'
      }).select('id').single()
      
      pillarId = newPillar?.id
    }

    if (!pillarId) throw new Error("Gagal menentukan pilar konten")

    const { error } = await supabase.from('content_ideas').insert({
      business_id: businessId,
      pillar_id: pillarId,
      title: title,
      description: content,
      status: 'pending'
    })

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengkonversi riset menjadi ide")
  }
}

export async function deleteResearchItem(businessId: string, itemId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('research_items').delete().eq('id', itemId).eq('business_id', businessId)
  
  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/${businessId}/research`)
  return { success: true }
}
