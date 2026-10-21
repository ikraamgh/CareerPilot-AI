// CareerPilot AI — Auth helpers (client-side)
// All functions use the browser Supabase client.

import { supabase } from "./supabase";

export interface AuthError {
  message: string;
}

/** Sign up with email + password. Returns user on success or an error message. */
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) return { user: null, error: { message: error.message } };
  return { user: data.user, error: null };
}

/** Sign in with email + password. */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { session: null, error: { message: error.message } };
  return { session: data.session, error: null };
}

/** Sign out and clear the session. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) return { error: { message: error.message } };
  return { error: null };
}

/** Get the current authenticated user (client-side). Returns null if not logged in. */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Get the current session (client-side). */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/** Subscribe to auth state changes. Returns the unsubscribe function. */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}
