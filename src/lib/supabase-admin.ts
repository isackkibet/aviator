import { createClient } from '@supabase/supabase-js'

// Service-role client for secure server writes/reads.
// During `next build`, env vars may not be present. Avoid hard-crashing at import time.
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if values are real (not placeholders)
const isValidConfig = supabaseUrl && 
  supabaseServiceRoleKey && 
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseServiceRoleKey.includes('your-service-role-key')

export const supabaseAdmin = isValidConfig
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null



