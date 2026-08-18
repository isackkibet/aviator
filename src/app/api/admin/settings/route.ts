import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const rows = await db()`select key, value from admin_settings`
    const settings: Record<string, string> = {}
    for (const row of rows) {
      settings[(row as { key: string }).key] = (row as { value: string }).value
    }
    return NextResponse.json({
      max_multiplier: Number(settings.max_multiplier) || 100,
      signals_running: settings.signals_running === 'true',
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    if (body.max_multiplier !== undefined) {
      const val = Math.max(1, Math.min(10000, Number(body.max_multiplier)))
      await db()`
        insert into admin_settings (key, value, updated_at) values ('max_multiplier', ${String(val)}, now())
        on conflict (key) do update set value = excluded.value, updated_at = now()
      `
    }

    if (body.signals_running !== undefined) {
      const val = body.signals_running ? 'true' : 'false'
      await db()`
        insert into admin_settings (key, value, updated_at) values ('signals_running', ${val}, now())
        on conflict (key) do update set value = excluded.value, updated_at = now()
      `
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
