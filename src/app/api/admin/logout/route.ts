import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST() {
  const token = (await cookies()).get('admin_token')?.value

  if (token && supabaseAdmin) {
    await supabaseAdmin.from('sessions').delete().eq('token', token)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', '', { httpOnly: true, path: '/', maxAge: 0 })

  return response
}
