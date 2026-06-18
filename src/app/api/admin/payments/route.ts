import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function getAdminId(): Promise<string | null> {
  const token = (await cookies()).get('admin_token')?.value
  if (!token || !supabaseAdmin) return null
  const { data } = await supabaseAdmin
    .from('sessions')
    .select('admin_id')
    .eq('token', token)
    .gte('expires_at', new Date().toISOString())
    .single()
  return data?.admin_id || null
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
  const offset = (page - 1) * limit

  let query = supabaseAdmin!
    .from('payments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (phone) {
    query = query.ilike('phone', `%${phone}%`)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ payments: data, total: count, page, limit })
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

  const { error } = await supabaseAdmin!
    .from('payments')
    .update({ status })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
