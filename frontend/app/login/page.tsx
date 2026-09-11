"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/store";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const login = useAuth((s) => s.login);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      router.push(searchParams.get("next") ?? "/account");
    } catch (err: any) {
      setError(err?.message ?? "Couldn't sign you in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[420px] px-5 py-24">
      <h1 className="font-display text-3xl tracking-tightest mb-2">Sign in</h1>
      <p className="text-ink/60 text-sm mb-8">Welcome back to Velara.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          type="email"
          placeholder="Email"
          className="w-full border border-line px-3.5 py-3 text-sm focus-ring"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="w-full border border-line px-3.5 py-3 text-sm focus-ring"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-clay">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-cream py-3.5 text-sm tracking-wide hover:bg-clay transition-colors duration-300 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6">
        New here?{" "}
        <Link href="/register" className="underline underline-offset-4 text-ink">
          Create an account
        </Link>
      </p>
      <p className="text-xs text-ink/40 mt-8">
        Demo admin: admin@velara.com / Admin123! · Demo customer: customer@example.com / Customer123!
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
