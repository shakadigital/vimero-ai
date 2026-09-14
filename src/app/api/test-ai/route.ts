import { NextResponse } from 'next/server'
import { runBusinessStrategist } from '@/lib/ai/agents/strategist'
import { runCopywriter } from '@/lib/ai/agents/copywriter'

export async function GET(request: Request) {
  // This diagnostic endpoint must never be available in production because it
  // spends provider quota and accepts arbitrary prompt input.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const agent = searchParams.get('agent') || 'strategist'
  const context = searchParams.get('context') || "Kami adalah kedai kopi lokal bernama 'Kopi Senja' yang menjual kopi robusta organik. Kami butuh strategi meningkatkan penjualan di jam sibuk pagi hari."

  if (agent !== 'strategist' && agent !== 'copywriter') {
    return NextResponse.json({ success: false, error: 'Agent tidak valid' }, { status: 400 })
  }

  if (context.length > 4000) {
    return NextResponse.json({ success: false, error: 'Context terlalu panjang' }, { status: 413 })
  }

  const businessId = "123e4567-e89b-12d3-a456-426614174000"

  try {
    if (agent === 'copywriter') {
      const result = await runCopywriter(businessId, context, "Santai dan ramah")
      return NextResponse.json({ success: true, agent: 'COPYWRITER', data: result })
    }

    const result = await runBusinessStrategist(businessId, context)
    return NextResponse.json({ success: true, agent: 'BUSINESS_STRATEGIST', data: result })
  } catch (error) {
    console.error('AI Test Route Error:', error)
    return NextResponse.json({ success: false, error: 'AI test gagal diproses' }, { status: 500 })
  }
}
