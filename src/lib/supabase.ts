import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and keys provided
const supabaseUrl = 'https://xyktnydhgbxizwccdpdy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5a3RueWRoZ2J4aXp3Y2NkcGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTQ3NTgsImV4cCI6MjA1MTEzMDc1OH0.x7vQ8YSbHqZmGO_DpFYpkR7AkvCfYkvfHNda70ZvKG8';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5a3RueWRoZ2J4aXp3Y2NkcGR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU1NDc1OCwiZXhwIjoyMDUxMTMwNzU4fQ.Rt_P4R8MxwO2LROU8D5Om7BRUzKxrMoBwmDtW2157rw';

// Standard client - uses anon key, relies on RLS for security for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client - uses service_role key, bypasses RLS. Use with caution, typically server-side.
// We might not need this often if RLS is comprehensive, but it's available.
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Type definitions matching Supabase schema (snake_case)
export type EventRow = {
  id: string; // uuid
  title: string; // text
  description: string | null; // text
  date: string; // timestamp with time zone
  image_url: string | null; // text
  event_type: 'birthday' | 'wedding' | 'baby_shower' | 'housewarming' | 'other' | null; // text
  share_link: string | null; // text
  created_by: string; // uuid references auth.users
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
};

export type GiftRow = {
  id: string; // uuid
  event_id: string; // uuid references events
  name: string; // text
  description: string | null; // text
  price: number | null; // numeric(10,2)
  image_url: string | null; // text
  url: string | null; // text
  store: string | null; // text
  priority: 'high' | 'medium' | 'low' | null; // text
  booked: boolean; // boolean
  booked_by: string | null; // uuid references auth.users
  date_added: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
};

// Type definition for user profiles (assuming a 'profiles' table exists or will be created)
export type ProfileRow = {
    id: string; // uuid, matches auth.users.id
    name: string | null;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    updated_at: string | null;
};
