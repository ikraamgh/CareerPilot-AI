"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { signIn, signUp } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client validation
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signup" && !form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    startTransition(async () => {
      if (mode === "login") {
        const { error: authError } = await signIn(form.email, form.password);
        if (authError) {
          setError(authError.message);
          return;
        }
        router.push(nextPath);
        router.refresh();
      } else {
        const { error: authError } = await signUp(form.email, form.password, form.fullName);
        if (authError) {
          setError(authError.message);
          return;
        }
        // Supabase sends a confirmation email by default.
        // Redirect to login with success message.
        router.push("/login?verified=1");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        {mode === "login"
          ? "Sign in to your CareerPilot workspace."
          : "Start managing your job search with AI."}
      </p>

      {/* Email confirmation notice on signup success */}
      {mode === "login" && searchParams.get("verified") && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          Account created! Check your email to confirm your address before signing in.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Alex Johnson"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1.5" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-colors",
            "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="text-xs text-slate-500 text-center mt-5">
        {mode === "login" ? (
          <>Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-emerald-600 hover:underline font-medium">Sign up</Link>
          </>
        ) : (
          <>Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">Sign in</Link>
          </>
        )}
      </p>
    </div>
  );
}
