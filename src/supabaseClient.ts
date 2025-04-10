import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xyktnydhgbxizwccdpdy.supabase.co'
// Using the anon key for client-side operations is standard practice.
// The service_role key should NOT be exposed in client-side code.
// We'll keep the service_role key here as requested but comment it out
// to prevent accidental exposure. Use it only in secure backend environments.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5a3RueWRoZ2J4aXp3Y2NkcGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTQ3NTgsImV4cCI6MjA1MTEzMDc1OH0.x7vQ8YSbHqZmGO_DpFYpkR7AkvCfYkvfHNda70ZvKG8'
// const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5a3RueWRoZ2J4aXp3Y2NkcGR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU1NDc1OCwiZXhwIjoyMDUxMTMwNzU4fQ.Rt_P4R8MxwO2LROU8D5Om7BRUzKxrMoBwmDtW2157rw'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Example of how you might use the service role key in a secure backend context (DO NOT USE IN FRONTEND)
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
