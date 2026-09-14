"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Category } from "@/lib/types";

export default function SearchBar({
  categories,
  className = "",
  onSubmitted,
}: {
  categories: Category[];
  className?: string;
  onSubmitted?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
    onSubmitted?.();
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-stretch border border-line bg-cream ${className}`}>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Search within category"
        className="hidden sm:block shrink-0 bg-cream text-sm text-ink/70 px-3 border-r border-line focus-ring max-w-[140px]"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="flex-1 min-w-0 bg-cream px-3.5 py-2.5 text-sm focus-ring"
      />

      <button
        type="submit"
        className="shrink-0 flex items-center gap-2 bg-ink text-cream px-4 md:px-5 text-sm hover:bg-clay transition-colors duration-300"
      >
        <Search size={16} strokeWidth={1.5} />
        <span className="hidden md:inline">Search</span>
      </button>
    </form>
  );
}
