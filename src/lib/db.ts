import type { NeonQueryFunction } from '@neondatabase/serverless'
import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL

const client: NeonQueryFunction<false, false> | null = databaseUrl ? neon(databaseUrl) : null

export function db(): NeonQueryFunction<false, false> {
  if (!client) {
    throw new Error('DATABASE_URL is not configured')
  }
  return client
}