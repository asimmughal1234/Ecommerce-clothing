"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/account");
  }, [loading, user, router]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-content px-5 md:px-10 py-14">
      <h1 className="font-display text-3xl md:text-4xl tracking-tightest mb-10">My account</h1>
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
        <div className="border hairline p-6">
          <p className="text-sm text-ink/50 mb-1">Name</p>
          <p>{user.name}</p>
        </div>
        <div className="border hairline p-6">
          <p className="text-sm text-ink/50 mb-1">Email</p>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6">
        <Link href="/account/orders" className="underline underline-offset-4 text-sm">
          View order history
        </Link>
        <button onClick={() => logout()} className="text-sm text-ink/60 hover:text-clay">
          Sign out
        </button>
      </div>
    </div>
  );
}
