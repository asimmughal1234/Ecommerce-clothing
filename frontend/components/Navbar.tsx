"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ShoppingBag, User as UserIcon, Menu, X, ChevronDown, Truck, Wallet } from "lucide-react";
import { useAuth, useCart } from "@/lib/store";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import Logo from "./Logo";
import SearchBar from "./SearchBar";

const BROWSE_LINKS = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?sort=newest", label: "New arrivals" },
  { href: "/shop?sort=price_asc", label: "Price: low to high" },
  { href: "/shop?sort=price_desc", label: "Price: high to low" },
  { href: "/shop?sort=name", label: "Alphabetical" },
];

const ORDER_LINKS = [
  { href: "/account/orders", label: "Track an order" },
  { href: "/account", label: "My account" },
  { href: "/cart", label: "View cart" },
];

function useIsActive(href: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [linkPath, linkQuery] = href.split("?");
  const linkCategory = new URLSearchParams(linkQuery).get("category");
  if (pathname !== linkPath) return false;
  return linkCategory ? searchParams.get("category") === linkCategory : !searchParams.get("category");
}

function NavItem({ href, label }: { href: string; label: string }) {
  const active = useIsActive(href);
  return (
    <Link
      href={href}
      className={`relative px-4 py-3.5 text-sm tracking-wide transition-colors duration-200 ${
        active ? "text-cream" : "text-cream/70 hover:text-cream"
      }`}
    >
      {label}
      <span
        className={`absolute left-4 right-4 bottom-2.5 h-[1.5px] bg-clay-light transition-transform duration-300 ease-editorial origin-left ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </Link>
  );
}

function StaticNavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-4 py-3.5 text-sm tracking-wide text-cream/70 hover:text-cream transition-colors">
      {label}
    </Link>
  );
}

function MegaMenu({ categories }: { categories: Category[] }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1.5 px-4 py-3.5 text-sm tracking-wide text-cream/70 group-hover:text-cream transition-colors duration-200">
        Shop
        <ChevronDown size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:rotate-180" />
      </button>

      <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-editorial absolute left-0 top-full z-50 w-[900px] max-w-[92vw] bg-paper text-ink border hairline shadow-2xl">
        <div className="grid grid-cols-[1fr_1fr_1fr_1.1fr]">
          <div className="p-7">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40 mb-4">Categories</p>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop?category=${c.slug}`} className="text-sm text-ink/75 hover:text-clay transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-7 border-l hairline">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40 mb-4">Browse</p>
            <ul className="space-y-2.5">
              {BROWSE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink/75 hover:text-clay transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-7 border-l hairline">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40 mb-4">Your orders</p>
            <ul className="space-y-2.5">
              {ORDER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink/75 hover:text-clay transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/shop?category=outerwear" className="relative min-h-[280px] border-l hairline overflow-hidden group/banner">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-editorial group-hover/banner:scale-105"
              sizes="260px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-6 text-cream">
              <p className="text-[11px] uppercase tracking-[0.14em] text-cream/70">This season</p>
              <p className="font-display text-2xl tracking-tightest mt-1.5 leading-tight">Outerwear</p>
              <span className="mt-3 text-xs border-b border-cream/50 pb-0.5 self-start">Shop now</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const user = useAuth((s) => s.user);
  const cart = useCart((s) => s.cart);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);

  useEffect(() => {
    api
      .get<{ categories: Category[] }>("/products/categories")
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <>
      <header className="relative z-30">
        <div className="bg-ink text-cream">
          <div className="mx-auto max-w-content px-5 md:px-10 h-9 flex items-center justify-between text-[11px] md:text-xs">
            <p className="flex items-center gap-2 text-cream/80">
              <Truck size={13} strokeWidth={1.5} />
              Free shipping on orders over Rs 6,000
            </p>
            <div className="hidden sm:flex items-center gap-6 text-cream/70">
              <span className="flex items-center gap-2">
                <Wallet size={13} strokeWidth={1.5} />
                Cash on delivery available
              </span>
              <Link href="/account/orders" className="link-underline hover:text-cream transition-colors">
                Track your order
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-paper border-b hairline">
          <div className="mx-auto max-w-content px-5 md:px-10 py-4 flex items-center gap-6">
            <Link href="/" className="text-ink shrink-0" aria-label="Velara home">
              <Logo />
            </Link>

            <div className="hidden lg:flex flex-1 justify-center">
              <SearchBar categories={categories} className="w-full max-w-xl" />
            </div>

            <div className="flex items-center gap-5 md:gap-7 ml-auto lg:ml-0">
              <Link
                href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/login"}
                className="hidden sm:flex items-center gap-2.5 text-ink hover:text-clay transition-colors focus-ring"
              >
                <UserIcon size={20} strokeWidth={1.5} />
                <span className="leading-tight text-left">
                  <span className="block text-[11px] text-ink/50">My account</span>
                  <span className="block text-sm font-medium">{user ? user.name.split(" ")[0] : "Sign in"}</span>
                </span>
              </Link>

              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2.5 text-ink hover:text-clay transition-colors focus-ring"
                aria-label="Open cart"
              >
                <span className="relative">
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {cart && cart.count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-clay text-cream text-[10px] w-4 h-4 flex items-center justify-center">
                      {cart.count}
                    </span>
                  )}
                </span>
                <span className="hidden sm:block leading-tight text-left">
                  <span className="block text-[11px] text-ink/50">Shopping cart</span>
                  <span className="block text-sm font-medium">{formatPrice(cart?.subtotal ?? 0)}</span>
                </span>
              </button>

              <button
                className="lg:hidden text-ink focus-ring"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          <div className="lg:hidden px-5 pb-4">
            <SearchBar categories={categories} onSubmitted={() => setMobileOpen(false)} />
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden border-b hairline bg-paper px-5 py-5 flex flex-col gap-1">
            <Link href="/" className="py-2.5 text-base" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/shop" className="py-2.5 text-base" onClick={() => setMobileOpen(false)}>
              Shop all
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="py-2.5 text-base text-ink/75"
                onClick={() => setMobileOpen(false)}
              >
                {c.name}
              </Link>
            ))}
            <div className="border-t hairline mt-3 pt-3 flex flex-col gap-1">
              <Link href="/account/orders" className="py-2.5 text-sm text-ink/70" onClick={() => setMobileOpen(false)}>
                Track an order
              </Link>
              <Link
                href={user ? "/account" : "/login"}
                className="py-2.5 text-sm text-ink/70"
                onClick={() => setMobileOpen(false)}
              >
                {user ? "My account" : "Sign in"}
              </Link>
            </div>
          </nav>
        )}
      </header>

      <div className="hidden lg:block sticky top-0 z-40 bg-ink text-cream shadow-[0_2px_20px_-6px_rgba(35,36,31,0.4)]">
        <nav className="mx-auto max-w-content px-5 md:px-10 flex items-center">
          <Suspense
            fallback={
              <>
                <StaticNavItem href="/" label="Home" />
                <StaticNavItem href="/shop" label="Shop" />
              </>
            }
          >
            <NavItem href="/" label="Home" />
          </Suspense>

          <MegaMenu categories={categories} />

          <Suspense fallback={null}>
            {categories.map((c) => (
              <NavItem key={c.id} href={`/shop?category=${c.slug}`} label={c.name} />
            ))}
          </Suspense>

          <Link
            href="/shop?sort=newest"
            className="ml-auto text-sm text-cream/70 hover:text-cream transition-colors"
          >
            New arrivals
          </Link>
        </nav>
      </div>
    </>
  );
}
