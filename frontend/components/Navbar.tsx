"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingBag, User as UserIcon, Menu, X } from "lucide-react";
import { useAuth, useCart } from "@/lib/store";

const links = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=outerwear", label: "Outerwear" },
  { href: "/shop?category=knitwear", label: "Knitwear" },
  { href: "/shop?category=tailoring", label: "Tailoring" },
];

function useActiveHref(href: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [linkPath, linkQuery] = href.split("?");
  const linkCategory = new URLSearchParams(linkQuery).get("category");
  if (pathname !== linkPath) return false;
  return linkCategory ? searchParams.get("category") === linkCategory : !searchParams.get("category");
}

function NavLink({ href, label }: { href: string; label: string }) {
  const isActive = useActiveHref(href);
  return (
    <Link
      href={href}
      className={`relative pb-1 text-base tracking-wide transition-colors ${
        isActive ? "text-clay font-medium" : "text-ink/80 hover:text-clay"
      }`}
    >
      {label}
      <span
        className={`absolute left-0 -bottom-0.5 h-[2px] bg-clay transition-transform duration-300 ease-editorial origin-left ${
          isActive ? "w-full scale-x-100" : "w-full scale-x-0"
        }`}
      />
    </Link>
  );
}

function StaticNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="relative pb-1 text-base tracking-wide text-ink/80 hover:text-clay transition-colors">
      {label}
    </Link>
  );
}

function NavLinks() {
  return (
    <Suspense fallback={links.map((l) => <StaticNavLink key={l.href} href={l.href} label={l.label} />)}>
      {links.map((l) => (
        <NavLink key={l.href} href={l.href} label={l.label} />
      ))}
    </Suspense>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuth((s) => s.user);
  const cart = useCart((s) => s.cart);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b hairline shadow-[0_2px_20px_-6px_rgba(35,36,31,0.12)]">
      <div className="mx-auto max-w-content px-5 md:px-10">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link
            href="/"
            className="font-display text-3xl md:text-4xl tracking-tightest text-ink"
          >
            VELARA<span className="text-clay">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/login"}
              className="hidden sm:flex items-center gap-2 text-[13px] text-ink/80 hover:text-ink focus-ring"
              aria-label="Account"
            >
              <UserIcon size={18} strokeWidth={1.5} />
              <span>{user ? user.name.split(" ")[0] : "Sign in"}</span>
            </Link>

            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center focus-ring"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} className="text-ink" />
              {cart && cart.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-clay text-cream text-[10px] w-4 h-4 flex items-center justify-center">
                  {cart.count}
                </span>
              )}
            </button>

            <button
              className="md:hidden focus-ring"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t hairline px-5 py-4 flex flex-col gap-4 bg-paper">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-base" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href={user ? "/account" : "/login"} className="text-base" onClick={() => setMobileOpen(false)}>
            {user ? "My account" : "Sign in"}
          </Link>
        </nav>
      )}
    </header>
  );
}
