"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/store";
import AuthLayout from "@/components/AuthLayout";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const REMEMBER_KEY = "velara_remembered_email";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const login = useAuth((s) => s.login);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      // localStorage unavailable — skip prefill
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, email);
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        // ignore storage failures
      }
      router.push(searchParams.get("next") ?? "/account");
    } catch (err: any) {
      setError(err?.message ?? "Couldn't sign you in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Sign in to manage your orders and account."
      footer={
        <>
          <p className="text-sm text-ink/60">
            New here?{" "}
            <Link href="/register" className="underline underline-offset-4 text-ink">
              Create an account
            </Link>
          </p>
          <div className="mt-6 border hairline bg-paper/60 px-4 py-3 text-xs text-ink/50 leading-relaxed">
            Demo admin: admin@velara.com / Admin123!
            <br />
            Demo customer: customer@example.com / Customer123!
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            required
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full border border-line pl-10 pr-3.5 py-3 text-sm focus-ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <Lock size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full border border-line pl-10 pr-11 py-3 text-sm focus-ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="accent-ink"
          />
          Remember my email
        </label>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-ink text-cream py-3.5 text-sm tracking-wide hover:bg-clay transition-colors duration-300 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
