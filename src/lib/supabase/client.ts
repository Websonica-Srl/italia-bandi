import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Satellite sites use anon key only - NO auth
export function createSatelliteClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side client (same as above for satellites, no auth needed)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
