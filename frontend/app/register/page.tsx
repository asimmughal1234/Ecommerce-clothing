"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";
import AuthLayout from "@/components/AuthLayout";
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthLayout
      icon={UserPlus}
      title="Create an account"
      subtitle="Faster checkout, order tracking, and early access to drops."
      footer={
        <p className="text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 text-ink">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            required
            placeholder="Full name"
            autoComplete="name"
            className="w-full border border-line pl-10 pr-3.5 py-3 text-sm focus-ring"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
            placeholder="Password (min. 8 characters)"
            autoComplete="new-password"
            minLength={8}
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

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-ink text-cream py-3.5 text-sm tracking-wide hover:bg-clay transition-colors duration-300 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
