"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const onSale = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price);

  return (
    <Link href={`/product/${product.slug}`} className="group block focus-ring">
      <div className="relative aspect-[4/5] bg-cream overflow-hidden">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
          />
        )}
        {product.isNewArrival && (
          <span className="absolute top-3 left-3 bg-cream/90 text-ink text-[11px] px-2 py-1">New</span>
        )}
        {onSale && (
          <span className="absolute top-3 right-3 bg-clay text-cream text-[11px] px-2 py-1">Sale</span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-ink">{product.name}</p>
          <p className="text-xs text-ink/55 mt-0.5">{product.category?.name}</p>
        </div>
        <div className="text-sm text-right whitespace-nowrap">
          {onSale && (
            <span className="text-ink/40 line-through mr-2">{formatPrice(product.compareAtPrice!)}</span>
          )}
          <span>{formatPrice(product.price)}</span>
        </div>
      </div>
    </Link>
  );
}
