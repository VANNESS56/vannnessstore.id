import { createClient } from '@supabase/supabase-js';
import { config } from './config';

if (!config.supabase.url || !config.supabase.anonKey || config.supabase.url === "YOUR_SUPABASE_URL") {
  console.warn("Supabase credentials are not configured. Please check your lib/config.ts or .env file.");
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);
