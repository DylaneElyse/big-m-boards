import { createBrowserClient } from '@supabase/ssr';

// Handle both Vercel auto-generated and manual environment variable names
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);
