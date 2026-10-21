// CareerPilot AI — Supabase Client
//
// IMPORTANT: We use @supabase/ssr's createBrowserClient (not @supabase/supabase-js's
// createClient) so the session is stored in COOKIES instead of localStorage.
// This allows proxy.ts (Next.js middleware) to read the session server-side
// and protect routes correctly. Without this, sign-in succeeds but the proxy
// sees no session and immediately redirects back to /login.

import { createBrowserClient } from "@supabase/ssr";

// Fallback during SSR/prerender so the build doesn't crash.
// Real values are inlined by Next.js from NEXT_PUBLIC_ env vars at build time.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "placeholder-key";

if (typeof window !== "undefined" && supabaseUrl === "https://placeholder.supabase.co") {
  console.error(
    "[CareerPilot] Missing NEXT_PUBLIC_SUPABASE_URL. " +
    "Add it to Vercel Environment Variables as Config type (not Secret)."
  );
}

/**
 * Browser Supabase client — singleton.
 * Uses @supabase/ssr so sessions are stored in cookies,
 * readable by the server-side proxy for route protection.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createBrowserClient<any>(supabaseUrl, supabaseKey);

/**
 * Server Supabase client factory.
 * Used in Server Components and Route Handlers.
 * Reads and writes the auth session via request cookies.
 */
export async function createServerSupabaseClient() {
  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
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
          // Server Component — read-only; proxy handles cookie refresh
        }
      },
    },
  });
}
