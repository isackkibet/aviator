import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''

export async function GET(req: Request) {
  const url = new URL(req.url)
  const reference = url.searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'reference is required' }, { status: 400 })
  }

  if (!PAYSTACK_SECRET) {
    const result = await db()`
      select status from payments where checkout_id = ${reference} limit 1
    `
    return NextResponse.json({ reference, status: result[0]?.status || 'unknown' })
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      }
    )
    const body = await paystackRes.json()

    if (body.status && body.data) {
      if (body.data.status === 'success') {
        await db()`
          update payments set status = 'paid' where checkout_id = ${reference}
        `
        return NextResponse.json({ reference, status: 'paid' })
      }
    }

    const result = await db()`
      select status from payments where checkout_id = ${reference} limit 1
    `
    return NextResponse.json({ reference, status: result[0]?.status || 'unknown' })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
