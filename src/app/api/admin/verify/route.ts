import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const token = (await cookies()).get('admin_token')?.value

  if (!token || !supabaseAdmin) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('*, admins(name, email)')
    .eq('token', token)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (!session) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 })
    response.cookies.set('admin_token', '', { httpOnly: true, path: '/', maxAge: 0 })
    return response
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      name: (session as any).admins?.name || '',
      email: (session as any).admins?.email || '',
    },
  })
}
