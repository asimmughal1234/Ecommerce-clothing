"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/types";

const PER_PAGE = 4;

export default function FeaturedCarousel({ products }: { products: Product[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(products.length / PER_PAGE);
  const visible = products.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
        {visible.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={page === 0 && i < 2} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
            className="w-10 h-10 flex items-center justify-center border hairline hover:bg-ink hover:text-cream transition-colors duration-300 focus-ring"
            aria-label="Show previous items"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Go to page ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i === page ? "bg-ink" : "bg-ink/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setPage((p) => (p + 1) % totalPages)}
            className="w-10 h-10 flex items-center justify-center border hairline hover:bg-ink hover:text-cream transition-colors duration-300 focus-ring"
            aria-label="Show next items"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
