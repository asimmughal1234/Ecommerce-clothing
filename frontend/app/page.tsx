import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import { Product, Category } from "@/lib/types";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function getFeatured(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?featured=true&limit=8`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
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

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeatured(), getCategories()]);

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-content px-5 md:px-10 py-20 md:py-28">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-3xl md:text-4xl tracking-tightest">This season's edit</h2>
          <Link href="/shop" className="link-underline text-sm hidden sm:block">
            View all
          </Link>
        </div>
        {featured.length > 0 ? (
          <FeaturedCarousel products={featured} />
        ) : (
          <p className="text-ink/60 text-sm">
            No products yet — run the database seed script to populate the catalog.
          </p>
        )}
      </section>

      {categories.length > 0 && (
        <section className="bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-content px-5 md:px-10">
            <h2 className="font-display text-3xl md:text-4xl tracking-tightest mb-10">Shop by category</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map((c) => (
                <Link key={c.id} href={`/shop?category=${c.slug}`} className="group block">
                  <div className="relative aspect-[3/4] bg-paper overflow-hidden">
                    {c.imageUrl && (
                      <Image
                        src={c.imageUrl}
                        alt={c.name}
                        fill
                        sizes="20vw"
                        className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-3 text-sm">{c.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-content px-5 md:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[4/3] bg-cream overflow-hidden order-2 md:order-1">
          <Image
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200"
            alt="Wool fabric bolts in the Velara workshop"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="order-1 md:order-2">
          <p className="text-sm text-clay mb-3">Our approach</p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tightest leading-tight mb-5">
            We buy fabric like it has to survive us.
          </h2>
          <p className="text-ink/70 leading-relaxed max-w-md">
            Most of what's sold as quality clothing is built to a price. We work
            the other way — choosing mills first, then designing around what the
            material can do. It costs more up front and less over ten years.
          </p>
        </div>
      </section>
    </div>
  );
}
