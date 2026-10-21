// CareerPilot AI — Supabase Client Utilities
// Uses @supabase/supabase-js directly for typed client (browser).
// Uses @supabase/ssr for server-side session handling.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (typeof window !== "undefined" && (!supabaseUrl || !supabaseKey)) {
  console.error(
    "[CareerPilot] Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL " +
    "and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local"
  );
}

/**
 * Typed browser Supabase client.
 * Singleton — safe to import in "use client" components.
 * Uses @supabase/supabase-js createClient with the Database generic
 * so all .from() calls are fully typed.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Server Supabase client factory.
 * Used in Server Components, Route Handlers, and the proxy.
 * Reads and writes auth session from request cookies.
 */
export async function createServerSupabaseClient() {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component — read-only; proxy handles refresh
        }
      },
    },
  });
}
