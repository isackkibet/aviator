import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  // Block non-admin emails immediately
  if (ADMIN_EMAIL && email.toLowerCase().trim() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  try {
    const rows = await db()`
      select *
      from admins
      where email = ${email.toLowerCase().trim()}
      limit 1
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const admin = rows[0] as {
      id: string
      password_hash: string
      name: string
      email: string
    }

    const [storedHash, salt] = admin.password_hash.split('.')
    const inputHash = hashPassword(password, salt)

    if (storedHash !== inputHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await db()`
      insert into sessions (admin_id, token, expires_at)
      values (${admin.id}, ${token}, ${expiresAt})
    `

    const response = NextResponse.json({ success: true, admin: { name: admin.name, email: admin.email } })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}