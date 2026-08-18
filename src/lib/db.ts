import dns from 'dns'
import type { NeonQueryFunction } from '@neondatabase/serverless'
import { neon } from '@neondatabase/serverless'

const origLookup = dns.lookup.bind(dns)
dns.lookup = function (hostname: string, options: any, callback?: any) {
  if (typeof options === 'function') { callback = options; options = {} }
  options = { ...options, family: 4 }
  return origLookup(hostname, options, callback)
} as typeof dns.lookup

const databaseUrl = process.env.DATABASE_URL

const client: NeonQueryFunction<false, false> | null = databaseUrl ? neon(databaseUrl) : null

export function db(): NeonQueryFunction<false, false> {
  if (!client) {
    throw new Error('DATABASE_URL is not configured')
  }
  return client
}

const cache = new Map<string, { data: unknown; expires: number }>()

export function getCached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && hit.expires > now) return Promise.resolve(hit.data as T)
  return fn().then((data) => {
    cache.set(key, { data, expires: now + ttlMs })
    return data
  })
}
