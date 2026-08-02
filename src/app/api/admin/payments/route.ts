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

export async function GET(req: Request) {
  const adminId = await getAdminId()
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const phone = url.searchParams.get('phone')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = 50
  const offset = Math.max(0, (page - 1) * limit)

  const cond: string[] = []
  const params: (string | number)[] = []

  if (status && status !== 'all') {
    params.push(status)
    cond.push(`status = $${params.length}`)
  }
  if (phone) {
    params.push(`%${phone}%`)
    cond.push(`phone ILIKE $${params.length}`)
  }

  const where = cond.length ? `where ${cond.join(' and ')}` : ''

  try {
    const payments = await db().query(
      `select * from payments ${where} order by created_at desc limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, limit, offset]
    )

    let total = 0
    try {
      const totalRows = await db().query(`select count(*)::int as c from payments ${where}`, params)
      total = (totalRows[0]?.c as number) || 0
    } catch {
      total = 0
    }

    return NextResponse.json({
      payments,
      total,
      page,
      limit,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const adminId = await getAdminId()
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status } = await req.json().catch(() => ({}))

  if (!id || !status) {
    return NextResponse.json({ error: 'id and status required' }, { status: 400 })
  }

  if (!['paid', 'failed', 'cancelled', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    await db()`
      update payments
      set status = ${status}
      where id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}