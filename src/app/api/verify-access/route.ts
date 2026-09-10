import { NextResponse } from 'next/server'
import { db, getCached } from '@/lib/db'

const PACKAGE_DURATIONS: Record<string, number> = {
  basic: 30,
  pro: 120,
  vip: 1440,
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const phone = url.searchParams.get('phone')

  if (!phone) {
    return NextResponse.json({ hasAccess: false, message: 'phone is required' }, { status: 400 })
  }

  try {
    const accessData = await getCached(`access:${phone}`, 5000, async () => {
      const rows = await db()`
        select package_id, amount, created_at
        from payments
        where phone = ${phone}
          and status = 'paid'
        order by created_at desc
        limit 1
      `
      return rows
    })

    const rows = accessData as { package_id: string; amount: string | number; created_at: string }[]

    if (rows.length === 0) {
      return NextResponse.json({ hasAccess: false, message: 'No active payment found' })
    }

    const data = rows[0]
    const durationMin = PACKAGE_DURATIONS[data.package_id]
    if (!durationMin) {
      return NextResponse.json({ hasAccess: false, message: 'Unknown package' })
    }

    const createdAt = new Date(data.created_at).getTime()
    const expiresAt = createdAt + durationMin * 60 * 1000
    const now = Date.now()

    if (now > expiresAt) {
      return NextResponse.json({ hasAccess: false, message: 'Access expired' })
    }

    return NextResponse.json({
      hasAccess: true,
      package_id: data.package_id,
      amount: data.amount,
      expires_at: new Date(expiresAt).toISOString(),
      message: `Active ${data.package_id} access`,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
