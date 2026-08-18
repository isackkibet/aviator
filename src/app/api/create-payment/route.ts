import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { CreatePaymentRequest } from '@/types/payment'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as CreatePaymentRequest

    const phone = (body.phone || body.PhoneNumber || '').toString().trim()
    const amount = Number((body as { amount?: unknown }).amount ?? 0)
    const packageId = (body.packageId || body.Provider || '').toString().trim()

    if (!phone) {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 })
    }
    if (!packageId) {
      return NextResponse.json({ error: 'packageId is required' }, { status: 400 })
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 })
    }

    const reference = `avi_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`

    const result = await db()`
      insert into payments (phone, package_id, amount, status, checkout_id)
      values (${phone}, ${packageId}, ${amount}, 'pending', ${reference})
      returning id
    `

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
        email: `${phone}@aviator.co.ke`,
        amount: amountInKobo,
        currency: 'KES',
        reference,
        callback_url: `${baseUrl}/payment/success?transaction=${reference}&package=${packageId}&amount=${amount}&phone=${phone}`,
        metadata: {
          phone,
          package_id: packageId,
          payment_id: result[0]?.id,
        },
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
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
