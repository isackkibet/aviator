import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

// ─── CORS ────────────────────────────────────────────────────────────────────
// Only these origins may call your API routes.
// Add your production domain once you know it.
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_PUBLIC_SITE_URL ?? '',        // e.g. https://yourapp.vercel.app
  process.env.NEXT_PUBLIC_CUSTOM_DOMAIN ?? '',   // e.g. https://yourdomain.com
].filter(Boolean))

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : null
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  if (allowed) headers['Access-Control-Allow-Origin'] = allowed
  return headers
}

// ─── Rate-limit config ───────────────────────────────────────────────────────
// Create-payment: 5 requests per 60 seconds per IP — stops payment spam/bots
const PAYMENT_LIMIT = 5
const PAYMENT_WINDOW_MS = 60_000

// Verify-access: 30 requests per 60 seconds per IP
const ACCESS_LIMIT = 30
const ACCESS_WINDOW_MS = 60_000

function getIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

// ─── Proxy (replaces middleware in Next.js 16.3+) ───────────────────────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')
  const ip = getIp(request)

  // ── Preflight (OPTIONS) — answer CORS before anything else ──
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
  }

  // ── Admin routes — require admin_token cookie ──
  if (pathname.startsWith('/api/admin')) {
    if (pathname !== '/api/admin/login' && pathname !== '/api/admin/verify') {
      const token = request.cookies.get('admin_token')?.value
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  // ── Rate limit: /api/create-payment ──
  if (pathname === '/api/create-payment') {
    const result = rateLimit(`pay:${ip}`, PAYMENT_LIMIT, PAYMENT_WINDOW_MS)
    if (!result.allowed) {
      const res = NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      )
      res.headers.set('Retry-After', String(Math.ceil((result.resetAt - Date.now()) / 1000)))
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => res.headers.set(k, v))
      return res
    }
  }

  // ── Rate limit: /api/verify-access ──
  if (pathname === '/api/verify-access') {
    const result = rateLimit(`access:${ip}`, ACCESS_LIMIT, ACCESS_WINDOW_MS)
    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429 }
      )
    }
  }

  // ── Attach CORS headers to all API responses ──
  const response = NextResponse.next()
  if (pathname.startsWith('/api/')) {
    Object.entries(corsHeaders(origin)).forEach(([k, v]) => response.headers.set(k, v))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
