import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

async function getAdminId(): Promise<string | null> {
  const token = (await cookies()).get('admin_token')?.value
  if (!token) return null

  try {
    const rows = await db()`
      select admin_id
      from sessions
      where token = ${token}
        and expires_at >= now()
      limit 1
    `
    return (rows[0]?.admin_id as string) || null
  } catch {
    return null
  }
}

export async function GET() {
  const adminId = await getAdminId()
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const totalPayments = await db()`
      select count(*)::int as c from payments
    ` as { c: number }[]
    const paidRows = await db()`
      select amount from payments where status = 'paid'
    ` as { amount: number }[]
    const revenue = paidRows.reduce((sum, r) => sum + Number(r.amount), 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayPayments = await db()`
      select count(*)::int as c from payments where created_at >= ${today.toISOString()}
    ` as { c: number }[]
    const pendingPayments = await db()`
      select count(*)::int as c from payments where status = 'pending'
    ` as { c: number }[]
    const paidTodayRows = await db()`
      select amount from payments
      where status = 'paid'
        and created_at >= ${today.toISOString()}
    ` as { amount: number }[]
    const revenueToday = paidTodayRows.reduce((sum, r) => sum + Number(r.amount), 0)

    const usersRows = await db()`
      select phone from payments
    ` as { phone: string }[]
    const uniquePhones = new Set(usersRows.map((u) => u.phone))

    const count = (rows: { c: number }[]) => rows[0]?.c ?? 0

    return NextResponse.json({
      totalPayments: count(totalPayments),
      totalRevenue: revenue,
      todayPayments: count(todayPayments),
      revenueToday,
      pendingPayments: count(pendingPayments),
      uniqueUsers: uniquePhones.size,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}