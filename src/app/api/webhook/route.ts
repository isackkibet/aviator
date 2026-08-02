import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  return NextResponse.json({ status: 'OK', message: 'Webhook ready' })
}

export async function POST(req: Request) {
  // PayHero webhook handling should:
  // - validate signature (if supported)
  // - read checkout/transaction id + result
  // - mark payments.status to paid/failed

  const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>

  const checkoutId = ((payload.checkoutId ?? payload.CheckoutRequestID) ?? '').toString()
  const statusRaw = ((payload.status ?? payload.paymentStatus) ?? '').toString().toLowerCase()

  if (!checkoutId) return NextResponse.json({ error: 'checkoutId is required' }, { status: 400 })

  const status = statusRaw === 'paid' ? 'paid' : statusRaw === 'failed' ? 'failed' : 'paid'

  try {
    const result = await db()`
      update payments
      set status = ${status}
      where checkout_id = ${checkoutId}
      returning id
    `
    if (result.length === 0) {
      return NextResponse.json({ error: 'payment not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, checkoutId, status })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}