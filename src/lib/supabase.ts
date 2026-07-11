// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Supabase Client Singleton
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://ordtlbzcypniwkpidumy.supabase.co'

const supabaseAnonKey: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZHRsYnpjeXBuaXdrcGlkdW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTA0NzEsImV4cCI6MjA5MTkyNjQ3MX0.pIMp3t2cIj86wsRWbqz2d6Fe0k6hpixunn_HfMNCULc'

if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
      'Add it to your .env file or set it at build time.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
      'Add it to your .env file or set it at build time.'
  )
}

// Singleton instance – imported everywhere in the app.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase
