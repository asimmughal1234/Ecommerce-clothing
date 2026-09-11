import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/ShopFilters";
import { Product, Category } from "@/lib/types";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function getProducts(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.q) params.set("q", searchParams.q);
  params.set("limit", "24");

  try {
    const res = await fetch(`${API_URL}/products?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return { items: [] as Product[], total: 0 };
    return (await res.json()) as { items: Product[]; total: number };
  } catch {
    return { items: [] as Product[], total: 0 };
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/products/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch {
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const [{ items, total }, categories] = await Promise.all([getProducts(searchParams), getCategories()]);

  return (
    <div className="mx-auto max-w-content px-5 md:px-10 py-14">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tightest">Shop all</h1>
        <p className="text-ink/60 text-sm mt-2">{total} piece{total === 1 ? "" : "s"}</p>
      </div>

      <ShopFilters categories={categories} />

      {items.length === 0 ? (
        <div className="py-24 text-center text-ink/60">
          <p>No products match these filters yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
