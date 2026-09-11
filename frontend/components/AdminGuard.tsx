"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login?next=/admin");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return <div className="mx-auto max-w-content px-5 md:px-10 py-24 text-sm text-ink/50">Checking access…</div>;
  }

  return <>{children}</>;
}
