"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-5 md:px-10 py-28 text-center">
        <h1 className="font-display text-3xl tracking-tightest mb-4">Your bag is empty</h1>
        <Link href="/shop" className="inline-block mt-4 underline underline-offset-4 text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-5 md:px-10 py-14">
      <h1 className="font-display text-3xl md:text-4xl tracking-tightest mb-10">Your bag</h1>
      <div className="grid md:grid-cols-[1fr_340px] gap-14">
        <ul className="divide-y hairline">
          {cart.items.map((item) => (
            <li key={item.id} className="flex gap-5 py-6">
              <div className="relative w-24 h-28 bg-cream shrink-0 overflow-hidden">
                {item.product.images[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="96px" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-ink/60 mt-1">{[item.size, item.color].filter(Boolean).join(" / ")}</p>
                  </div>
                  <p>{formatPrice(Number(item.product.price) * item.quantity)}</p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center border border-line">
                    <button className="w-8 h-8 focus-ring" onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}>−</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button className="w-8 h-8 focus-ring" onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-xs text-ink/50 hover:text-clay underline underline-offset-4">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="border hairline p-6 h-fit space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-ink/70">Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <p className="text-xs text-ink/50">Shipping and taxes calculated at checkout.</p>
          <Link
            href="/checkout"
            className="block w-full text-center bg-ink text-cream py-3.5 text-sm tracking-wide hover:bg-clay transition-colors duration-300"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
