"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateItem, removeItem } = useCart();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-ink/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-cream z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b hairline">
              <h2 className="font-display text-xl">Your bag {cart && cart.count > 0 ? `(${cart.count})` : ""}</h2>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close cart" className="focus-ring">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!cart || cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-20">
                  <p className="text-ink/70">Your bag is empty.</p>
                  <Link
                    href="/shop"
                    onClick={() => setDrawerOpen(false)}
                    className="text-sm underline underline-offset-4"
                  >
                    Continue shopping
                  </Link>
                </div>
              ) : (
                <ul className="divide-y hairline">
                  {cart.items.map((item) => (
                    <li key={item.id} className="flex gap-4 py-5">
                      <div className="relative w-20 h-24 bg-paper shrink-0 overflow-hidden">
                        {item.product.images[0] && (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">{item.product.name}</p>
                          <p className="text-sm whitespace-nowrap">{formatPrice(item.product.price)}</p>
                        </div>
                        <p className="text-xs text-ink/60 mt-1">
                          {[item.size, item.color].filter(Boolean).join(" / ")}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            className="w-6 h-6 flex items-center justify-center border hairline focus-ring"
                            onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            className="w-6 h-6 flex items-center justify-center border hairline focus-ring"
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            className="text-xs text-ink/50 hover:text-clay ml-auto underline underline-offset-4"
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart && cart.items.length > 0 && (
              <div className="border-t hairline px-6 py-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/70">Subtotal</span>
                  <span className="font-medium">{formatPrice(cart.subtotal)}</span>
                </div>
                <p className="text-xs text-ink/50">Shipping and taxes calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full text-center bg-ink text-cream py-3.5 text-sm tracking-wide hover:bg-clay transition-colors duration-300"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
