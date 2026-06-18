// Run this script ONCE to create your first admin:
//   node scripts/seed-admin.mjs
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from '@supabase/supabase-js'
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
    return [k.trim(), v.join('=').trim()]
  })
)

const supabaseUrl = envVars.SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

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

  const { data, error } = await supabase
    .from('admins')
    .upsert({ email: email.toLowerCase().trim(), password_hash: passwordHash, name }, { onConflict: 'email' })
    .select()
    .single()

  if (error) {
    console.error('Error creating admin:', error.message)
    process.exit(1)
  }

  console.log('✅ Admin created successfully!')
  console.log(`   Email:    ${email}`)
  console.log(`   Password: ${password}`)
  console.log(`   Name:     ${name}`)
}

main()
