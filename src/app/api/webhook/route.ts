import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''

function verifyPaystackSignature(body: string, signature: string): boolean {
  if (!PAYSTACK_SECRET) return false
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex')
  return hash === signature
}

export async function GET() {
  return NextResponse.json({ status: 'OK', message: 'Paystack webhook ready' })
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature') || ''

    if (PAYSTACK_SECRET && !verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as {
      event: string
      data: {
        reference?: string
        status?: string
        amount?: number
        metadata?: Record<string, unknown>
        gateway_response?: string
      }
    }

    const { event, data } = payload
    const reference = data?.reference || ''

    if (!reference) {
      return NextResponse.json({ error: 'reference is required' }, { status: 400 })
    }

    let status = 'pending'
    if (event === 'charge.success') {
      status = 'paid'
    } else if (event === 'charge.failed' || event === 'charge.abandoned') {
      status = 'failed'
    } else {
      return NextResponse.json({ ok: true, message: `Ignored event: ${event}` })
    }

    const result = await db()`
      update payments
      set status = ${status}
      where checkout_id = ${reference}
      returning id, phone, package_id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'payment not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, reference, status })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
