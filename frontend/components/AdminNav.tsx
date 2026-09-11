"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-6 border-b hairline mb-10">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`pb-4 text-sm ${pathname === l.href ? "border-b border-ink text-ink" : "text-ink/50 hover:text-ink"}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
