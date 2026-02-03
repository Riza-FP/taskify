import { createClient } from '@supabase/supabase-js'
import { config } from '../utils/config.js'
import type { Database } from '../../database.types.js';


// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(config.supabase.site_url!, config.supabase.key!, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});
