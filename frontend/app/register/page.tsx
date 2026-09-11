"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const register = useAuth((s) => s.register);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(name, email, password);
      router.push("/account");
    } catch (err: any) {
      setError(err?.message ?? "Couldn't create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[420px] px-5 py-24">
      <h1 className="font-display text-3xl tracking-tightest mb-2">Create an account</h1>
      <p className="text-ink/60 text-sm mb-8">Faster checkout, order tracking, and early access to drops.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Full name"
          className="w-full border border-line px-3.5 py-3 text-sm focus-ring"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          placeholder="Password (min. 8 characters)"
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4 text-ink">
          Sign in
        </Link>
      </p>
    </div>
  );
}
