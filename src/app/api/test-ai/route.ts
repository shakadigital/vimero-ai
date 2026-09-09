import { NextResponse } from 'next/server'
import { runBusinessStrategist } from '@/lib/ai/agents/strategist'
import { runCopywriter } from '@/lib/ai/agents/copywriter'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const agent = searchParams.get('agent') || 'strategist'
  const context = searchParams.get('context') || "Kami adalah kedai kopi lokal bernama 'Kopi Senja' yang menjual kopi robusta organik. Kami butuh strategi meningkatkan penjualan di jam sibuk pagi hari."
  
  // Dummy ID, RLS tidak berpengaruh di level rute API jika kita mem-bypass auth atau karena ini test route.
  // Tapi untuk pelacakan `ai_usage` butuh UUID valid yang ada di tabel businesses.
  // Idealnya Anda harus mengganti UUID ini dengan ID bisnis yang benar-benar ada di db Anda, atau API log gagal.
  // Namun, meskipun log gagal, data AI tetap kembali.
  const businessId = "123e4567-e89b-12d3-a456-426614174000" 

  try {
    if (agent === 'copywriter') {
      const result = await runCopywriter(businessId, context, "Santai dan ramah")
      return NextResponse.json({ success: true, agent: 'COPYWRITER', data: result })
    } else {
      const result = await runBusinessStrategist(businessId, context)
      return NextResponse.json({ success: true, agent: 'BUSINESS_STRATEGIST', data: result })
    }
  } catch (error: any) {
    console.error('AI Test Route Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
