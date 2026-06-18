import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import crypto from 'crypto'

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!admin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const [storedHash, salt] = (admin.password_hash as string).split('.')
  const inputHash = hashPassword(password, salt)

  if (storedHash !== inputHash) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await supabaseAdmin.from('sessions').insert({
    admin_id: admin.id,
    token,
    expires_at: expiresAt,
  })

  const response = NextResponse.json({ success: true, admin: { name: admin.name, email: admin.email } })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return response
}
