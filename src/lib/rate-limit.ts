/**
 * Simple in-memory sliding-window rate limiter.
 * Works per-IP (or any string key) and resets after `windowMs`.
 *
 * NOTE: This is per-instance. On serverless (Vercel) each cold start gets its
 * own memory, so it's a best-effort guard — good enough to stop casual abuse
 * and bots. For stricter enforcement use Redis (Upstash) later.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Module-level store — survives across requests in the same Lambda instance
const store = new Map<string, RateLimitEntry>()

// Purge stale keys every 5 minutes so memory doesn't grow unbounded
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * @param key      Identifier — typically the client IP address
 * @param limit    Max requests allowed in the window
 * @param windowMs Window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // Fresh window
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/**
 * Convenience: extract the real client IP from a Next.js Request.
 * Checks x-forwarded-for (set by Vercel/proxies) then falls back to
 * x-real-ip and finally a placeholder.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
