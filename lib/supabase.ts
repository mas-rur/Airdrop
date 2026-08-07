import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

/**
 * Falls back to obviously-invalid placeholders when env vars are missing
 * so the app doesn't crash at import time -- callers should check
 * `supabaseConfigured` (or just handle the resulting fetch error) before
 * relying on real data back.
 */
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);
