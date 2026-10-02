import { createClient } from '@supabase/supabase-js';

// Environment variable credentials with live project defaults
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://rqepidxepeafwjojowzr.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZXBpZHhlcGVhZndqb2pvd3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NzY5MjksImV4cCI6MjEwNjQ1MjkyOX0.qIKpleKkREsYv_rRskR9eEcS3pl1an7xnEhKXSz1AKQ';

// Determine if live Supabase is active
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

// Export initialized client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
