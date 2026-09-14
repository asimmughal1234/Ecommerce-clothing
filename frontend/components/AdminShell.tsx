"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Store } from "lucide-react";
import { useAuth } from "@/lib/store";
import Logo from "./Logo";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

export default function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen md:flex bg-paper">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-ink text-cream">
        <Link href="/" className="px-6 py-7 border-b border-cream/10 text-cream">
          <Logo tone="cream" size={30} />
        </Link>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-200 ${
                  active ? "bg-cream text-ink" : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-6 border-t border-cream/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors duration-200"
          >
            <Store size={18} strokeWidth={1.5} />
            Back to store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors duration-200"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b hairline px-5 md:px-10 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl tracking-tightest truncate">{title}</h1>
            {subtitle && <p className="text-sm text-ink/50 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-ink text-cream flex items-center justify-center text-sm font-medium rounded-full">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="hidden sm:block text-sm leading-tight">
              <p>{user?.name}</p>
              <p className="text-ink/50 text-xs">Administrator</p>
            </div>
          </div>
        </header>

        <nav className="md:hidden flex gap-1 px-5 py-3 border-b hairline overflow-x-auto">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 px-3 py-1.5 text-sm transition-colors duration-200 ${
                  active ? "bg-ink text-cream" : "text-ink/60"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <button onClick={handleLogout} className="shrink-0 px-3 py-1.5 text-sm text-clay">
            Sign out
          </button>
        </nav>

        <main className="px-5 md:px-10 py-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
