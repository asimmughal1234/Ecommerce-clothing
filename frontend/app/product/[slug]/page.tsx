import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartPanel from "@/components/AddToCartPanel";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as { product: Product; related: Product[] };
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);
  if (!data) notFound();
  const { product, related } = data;

  return (
    <div className="mx-auto max-w-content px-5 md:px-10 py-12">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        <div className="space-y-3">
          <div className="relative aspect-[4/5] bg-cream overflow-hidden">
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative aspect-square bg-cream overflow-hidden">
                  <Image src={img} alt={`${product.name} detail ${i + 2}`} fill className="object-cover" sizes="200px" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:sticky md:top-28 md:self-start">
          <p className="text-sm text-ink/50 mb-2">{product.category?.name}</p>
          <h1 className="font-display text-3xl md:text-4xl tracking-tightest leading-tight">{product.name}</h1>
          <p className="text-xl mt-4">
            {formatPrice(product.price)}
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <span className="text-ink/40 line-through ml-3 text-base">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </p>

          <p className="text-ink/70 leading-relaxed mt-6 max-w-md">{product.description}</p>
          {product.material && <p className="text-sm text-ink/50 mt-3">Material: {product.material}</p>}

          <div className="mt-8">
            <AddToCartPanel product={product} />
          </div>

          {product.story && (
            <div className="mt-10 pt-8 border-t hairline">
              <p className="text-sm font-medium mb-2">From the workshop</p>
              <p className="text-sm text-ink/70 leading-relaxed">{product.story}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-2xl tracking-tightest mb-8">You might also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
