import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Shared Supabase client for realtime subscriptions
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
