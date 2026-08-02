import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function POST() {
  const token = (await cookies()).get('admin_token')?.value

  if (token) {
    try {
      await db()`
        delete from sessions
        where token = ${token}
      `
    } catch {
      // ignore deletion errors on logout
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', '', { httpOnly: true, path: '/', maxAge: 0 })

  return response
}