import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

  if (!supabaseAdmin) {
    return NextResponse.json({ hasAccess: false, message: 'Supabase admin not configured' }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('package_id, amount, created_at')
    .eq('phone', phone)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ hasAccess: false, message: 'No active payment found' })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

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
}
