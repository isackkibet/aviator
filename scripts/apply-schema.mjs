import dns from 'dns'
const origLookup = dns.lookup.bind(dns)
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') { callback = options; options = {} }
  options = { ...options, family: 4 }
  return origLookup(hostname, options, callback)
}

import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const url = process.env.DATABASE_URL
if (!url) { console.error('DATABASE_URL required'); process.exit(1) }

const sql = neon(url)
const schema = readFileSync(resolve('src/lib/neon-schema.sql'), 'utf-8')
const statements = schema.split(';').map((s) => s.trim()).filter(Boolean)

for (const stmt of statements) { await sql.query(stmt) }
console.log('Schema applied successfully')