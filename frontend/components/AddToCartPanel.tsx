"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useAuth } from "@/lib/store";
import { Product } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export default function AddToCartPanel({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "added" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const addItem = useCart((s) => s.addItem);
  const user = useAuth((s) => s.user);
  const router = useRouter();

  const outOfStock = product.stock <= 0;

  async function handleAdd() {
    if (!user) {
      router.push(`/login?next=/product/${product.slug}`);
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await addItem(product.id, quantity, size || undefined, color || undefined);
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1800);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message ?? "Couldn't add that to your bag.");
    }
  }

  return (
    <div className="space-y-6">
      {product.sizes.length > 0 && (
        <div>
          <p className="text-sm mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3.5 py-2 text-sm border focus-ring ${
                  size === s ? "border-ink bg-ink text-cream" : "border-line hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors.length > 0 && (
        <div>
          <p className="text-sm mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`px-3.5 py-2 text-sm border focus-ring ${
                  color === c ? "border-ink bg-ink text-cream" : "border-line hover:border-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-sm">Quantity</p>
        <div className="flex items-center border border-line">
          <button
            className="w-9 h-9 flex items-center justify-center focus-ring"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            className="w-9 h-9 flex items-center justify-center focus-ring"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={outOfStock || status === "loading"}
        className="w-full bg-ink text-cream py-4 text-sm tracking-wide hover:bg-clay transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {outOfStock
              ? "Out of stock"
              : status === "loading"
              ? "Adding…"
              : status === "added"
              ? "Added to bag"
              : "Add to bag"}
          </motion.span>
        </AnimatePresence>
      </button>

      {status === "error" && <p className="text-sm text-clay">{errorMsg}</p>}

      <p className="text-xs text-ink/50">{product.stock} in stock · Ships in 2–4 business days</p>
    </div>
  );
}
