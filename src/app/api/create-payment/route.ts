import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''

// ─── Valid package IDs and their expected amounts ────────────────────────────
const PACKAGES: Record<string, number> = {
  basic: 100,
  pro: 500,
  vip: 2000,
}

// ─── Input schema ─────────────────────────────────────────────────────────────
const CreatePaymentSchema = z.object({
  // Accept both field name variants the frontend sends
  phone: z
    .string()
    .min(9, 'Phone number too short')
    .max(15, 'Phone number too long')
    .regex(/^[+0-9]+$/, 'Phone must contain only digits and an optional leading +'),
  packageId: z
    .string()
    .refine((v) => Object.keys(PACKAGES).includes(v), {
      message: `packageId must be one of: ${Object.keys(PACKAGES).join(', ')}`,
    }),
  amount: z
    .number()
    .positive('amount must be positive')
    .max(100_000, 'amount exceeds maximum'),
})

export async function POST(req: Request) {
  try {
    // ── Parse body safely ──
    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // ── Validate with Zod ──
    const parsed = CreatePaymentSchema.safeParse(rawBody)
    if (!parsed.success) {
      const messages = parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
      return NextResponse.json({ error: messages.join(', ') }, { status: 422 })
    }

    const { phone, packageId, amount } = parsed.data

    // ── Cross-check: amount must match the package price exactly ──
    const expectedAmount = PACKAGES[packageId]
    if (amount !== expectedAmount) {
      return NextResponse.json(
        { error: `Amount ${amount} does not match package price ${expectedAmount}` },
        { status: 422 }
      )
    }

    const reference = `avi_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`

    await db()`
      insert into payments (phone, package_id, amount, status, checkout_id)
      values (${phone}, ${packageId}, ${amount}, 'pending', ${reference})
      returning id
    `

    // ── No Paystack key — mock mode ──
    if (!PAYSTACK_SECRET) {
      return NextResponse.json({
        message: 'Paystack not configured. Payment stored as pending.',
        checkoutId: reference,
        provider: 'mock',
      })
    }

    const amountInKobo = Math.round(amount * 100)
    const baseUrl = req.headers.get('origin') || 'http://localhost:3000'

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `${phone.replace(/[^0-9]/g, '')}@aviator.co.ke`,
        amount: amountInKobo,
        currency: 'KES',
        reference,
        callback_url: `${baseUrl}/payment/success?transaction=${reference}&package=${packageId}&amount=${amount}&phone=${encodeURIComponent(phone)}`,
        metadata: { phone, package_id: packageId },
        mobile_money: {
          phone: phone.startsWith('0') ? `254${phone.slice(1)}` : phone,
        },
      }),
    })

    const paystackData = await paystackRes.json()

    if (!paystackRes.ok || !paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || 'Paystack initialization failed', checkoutId: reference },
        { status: 400 }
      )
    }

    return NextResponse.json({
      checkoutId: reference,
      authorization_url: paystackData.data?.authorization_url,
      access_code: paystackData.data?.access_code,
      stk: {
        CheckoutRequestID: reference,
        ResponseCode: '0',
        ResponseDescription: 'STK push initiated via Paystack',
      },
    })
  } catch (error) {
    console.error('Create-payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
