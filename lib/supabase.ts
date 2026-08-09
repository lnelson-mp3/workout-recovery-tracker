import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client. Import this only from Next.js API routes,
// route handlers, or the Vercel Cron job — never from a client component.
// There is no NEXT_PUBLIC_ variant: per the build spec, the browser never
// talks to Supabase directly, and this app has no auth/RLS layer, so the
// secret key must never reach the client bundle.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
  },
});
