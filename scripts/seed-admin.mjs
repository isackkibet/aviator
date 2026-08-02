// Run this script ONCE to create your first admin:
//   node scripts/seed-admin.mjs
//
// Requires DATABASE_URL in .env.local

import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = Object.fromEntries(
  envContent.split('\n').filter(Boolean).map((l) => {
    const [k, ...v] = l.split('=')
    const rawValue = v.join('=').trim()
    const value = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
    return [k.trim(), value]
  })
)

const databaseUrl = envVars.DATABASE_URL

if (!databaseUrl) {
  console.error('Error: DATABASE_URL must be set in .env.local')
  process.exit(1)
}

const sql = neon(databaseUrl)

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}

async function main() {
  const email = process.argv[2] || 'admin@example.com'
  const password = process.argv[3] || 'admin123'
  const name = process.argv[4] || 'Super Admin'

  const salt = crypto.randomBytes(16).toString('hex')
  const hashed = hashPassword(password, salt)
  const passwordHash = `${hashed}.${salt}`

  try {
    await sql`
      insert into admins (email, password_hash, name)
      values (${email.toLowerCase().trim()}, ${passwordHash}, ${name})
      on conflict (email)
      do update set password_hash = excluded.password_hash, name = excluded.name
    `
  } catch (error) {
    console.error('Error creating admin:', error.message)
    process.exit(1)
  }

  console.log('Admin created successfully!')
  console.log(`   Email:    ${email}`)
  console.log(`   Password: ${password}`)
  console.log(`   Name:     ${name}`)
}

main()