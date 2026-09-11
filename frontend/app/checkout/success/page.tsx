"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/store";
import { Check } from "lucide-react";

export default function CheckoutSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const fetchCart = useCart((s) => s.fetchCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="mx-auto max-w-content px-5 md:px-10 py-28 text-center">
      <div className="w-14 h-14 rounded-full bg-moss text-cream flex items-center justify-center mx-auto mb-6">
        <Check size={26} />
      </div>
      <h1 className="font-display text-3xl md:text-4xl tracking-tightest mb-3">Order placed</h1>
      <p className="text-ink/70">
        {searchParams.order ? `Confirmation ${searchParams.order} is on its way to your inbox.` : "Thank you for your order."}
      </p>
      <div className="flex items-center justify-center gap-6 mt-8">
        <Link href="/account/orders" className="underline underline-offset-4 text-sm">
          View your orders
        </Link>
        <Link href="/shop" className="underline underline-offset-4 text-sm">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
