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

export async function GET() {
  const adminId = await getAdminId()
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { count: totalPayments } = await supabaseAdmin!
    .from('payments')
    .select('*', { count: 'exact', head: true })

  const { data: totalRevenue } = await supabaseAdmin!
    .from('payments')
    .select('amount')
    .eq('status', 'paid')

  const revenue = (totalRevenue || []).reduce((sum, r) => sum + Number(r.amount), 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: todayPayments } = await supabaseAdmin!
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  const { count: pendingCount } = await supabaseAdmin!
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { data: paidToday } = await supabaseAdmin!
    .from('payments')
    .select('amount')
    .eq('status', 'paid')
    .gte('created_at', today.toISOString())

  const revenueToday = (paidToday || []).reduce((sum, r) => sum + Number(r.amount), 0)

  const { data: usersList } = await supabaseAdmin!
    .from('payments')
    .select('phone')

  const uniquePhones = new Set((usersList || []).map((u) => u.phone))

  return NextResponse.json({
    totalPayments: totalPayments || 0,
    totalRevenue: revenue,
    todayPayments: todayPayments || 0,
    revenueToday,
    pendingPayments: pendingCount || 0,
    uniqueUsers: uniquePhones.size,
  })
}
