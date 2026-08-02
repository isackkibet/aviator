import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function GET() {
  const token = (await cookies()).get('admin_token')?.value

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const rows = await db()`
      select s.token, a.name, a.email
      from sessions s
      join admins a on a.id = s.admin_id
      where s.token = ${token}
        and s.expires_at >= now()
      limit 1
    `

    if (rows.length === 0) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 })
      response.cookies.set('admin_token', '', { httpOnly: true, path: '/', maxAge: 0 })
      return response
    }

    const session = rows[0] as { name: string; email: string }

    return NextResponse.json({
      authenticated: true,
      admin: {
        name: session.name || '',
        email: session.email || '',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}