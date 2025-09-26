import { createBrowserClient } from '@supabase/ssr';

// Use Vercel/Supabase integration environment variable names
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
