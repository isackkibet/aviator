import { NextResponse } from 'next/server'
import { db, getCached } from '@/lib/db'

export async function GET() {
  try {
    const data = await getCached('public_settings', 10000, async () => {
      const rows = await db()`select key, value from admin_settings`
      const settings: Record<string, string> = {}
      for (const row of rows) {
        settings[(row as { key: string }).key] = (row as { value: string }).value
      }
      return {
        max_multiplier: Number(settings.max_multiplier) || 100,
        signals_running: settings.signals_running === 'true',
      }
    })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ max_multiplier: 100, signals_running: false })
  }
}
