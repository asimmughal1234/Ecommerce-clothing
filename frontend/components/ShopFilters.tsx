"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category } from "@/lib/types";

export default function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b hairline mb-10">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <button
          onClick={() => updateParam("category", "")}
          className={`text-sm ${activeCategory === "" ? "text-ink border-b border-ink" : "text-ink/50 hover:text-ink"}`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => updateParam("category", c.slug)}
            className={`text-sm ${activeCategory === c.slug ? "text-ink border-b border-ink" : "text-ink/50 hover:text-ink"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <select
        value={activeSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="text-sm bg-transparent border hairline px-3 py-2 focus-ring"
        aria-label="Sort products"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="name">Name A–Z</option>
      </select>
    </div>
  );
}
