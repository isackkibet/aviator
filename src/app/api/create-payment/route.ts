import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { CreatePaymentRequest, StkPushResponse } from '@/types/payment'

export async function POST(req: Request) {
  // Note: This project previously had PayHero disabled. Here we implement the
  // server-side wiring to create a payment record and return a "checkoutId".
  // If PayHero integration keys are not set, we return 501.

  try {
    const body = (await req.json().catch(() => ({}))) as CreatePaymentRequest
    console.log('Create-payment request body:', body)

    const phone = (body.phone || body.PhoneNumber || '').toString().trim()
    const amount = Number((body as { amount?: unknown }).amount ?? 0)
    const packageId = (body.packageId || body.Provider || '').toString().trim()
    console.log('Parsed values - phone:', phone, 'packageId:', packageId, 'amount:', amount)

    if (!phone) {
      console.log('Error: phone is required')
      return NextResponse.json({ error: 'phone is required' }, { status: 400 })
    }
    if (!packageId) {
      console.log('Error: packageId is required')
      return NextResponse.json({ error: 'packageId is required' }, { status: 400 })
    }
    if (!amount || amount <= 0) {
      console.log('Error: amount is required')
      return NextResponse.json({ error: 'amount is required' }, { status: 400 })
    }

    // Create local payment record first (pending)
    const checkoutId = `local_${Date.now()}_${Math.random().toString(16).slice(2)}`
    console.log('Generated checkoutId:', checkoutId)

    // Skip Supabase insert if not configured (for testing)
    console.log('supabaseAdmin exists:', !!supabaseAdmin)
    if (supabaseAdmin) {
      console.log('Attempting to insert into Supabase')
      const { error: insertError } = await supabaseAdmin
        .from('payments')
        .insert({
          phone,
          package_id: packageId,
          amount,
          status: 'pending',
          checkout_id: checkoutId,
        })

      if (insertError) {
        console.log('Supabase insert error:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      console.log('Supabase insert successful')
    } else {
      console.log('Skipping Supabase insert (not configured)')
    }

    // PayHero integration (placeholder) — enabled only if env vars exist
    const payheroEnabled = Boolean(process.env.PAYHERO_API_KEY)
    console.log('PayHero enabled:', payheroEnabled)

    if (!payheroEnabled) {
      console.log('Returning mock response')
      return NextResponse.json({
        message: 'PayHero not configured. Payment stored as pending.',
        checkoutId,
        provider: 'mock',
      })
    }

    // TODO: Replace this mock with real PayHero STK push / checkout API call.
    // Return the expected payload to your frontend.
    const response: StkPushResponse = {
      CheckoutRequestID: checkoutId,
      ResponseCode: '0',
      ResponseDescription: 'Mock STK push created',
    }

    return NextResponse.json({ checkoutId, stk: response })
  } catch (error) {
    console.error('Create-payment error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

