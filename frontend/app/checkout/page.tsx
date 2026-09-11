"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useAuth } from "@/lib/store";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCart();
  const { user, loading } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "COD">("CARD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/checkout");
  }, [loading, user, router]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-5 md:px-10 py-28 text-center">
        <p className="text-ink/60">Your bag is empty.</p>
      </div>
    );
  }

  const SHIPPING = cart.subtotal >= 6000 ? 0 : 250;
  const total = cart.subtotal + SHIPPING;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post<{ order: { orderNumber: string }; checkoutUrl: string | null }>(
        "/orders/checkout",
        { paymentMethod, shippingAddress: form }
      );
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        router.push(`/checkout/success?order=${res.order.orderNumber}`);
      }
    } catch (err: any) {
      setError(err?.message ?? "Checkout failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-content px-5 md:px-10 py-14">
      <h1 className="font-display text-3xl md:text-4xl tracking-tightest mb-10">Checkout</h1>
      <div className="grid md:grid-cols-[1fr_360px] gap-14">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-sm font-medium mb-4">Shipping address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                placeholder="Full name"
                className="border border-line px-3.5 py-3 text-sm focus-ring sm:col-span-2"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <input
                required
                placeholder="Address line 1"
                className="border border-line px-3.5 py-3 text-sm focus-ring sm:col-span-2"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
              <input
                placeholder="Address line 2 (optional)"
                className="border border-line px-3.5 py-3 text-sm focus-ring sm:col-span-2"
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
              <input
                required
                placeholder="City"
                className="border border-line px-3.5 py-3 text-sm focus-ring"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                required
                placeholder="State / Province"
                className="border border-line px-3.5 py-3 text-sm focus-ring"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <input
                required
                placeholder="Postal code"
                className="border border-line px-3.5 py-3 text-sm focus-ring"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              />
              <input
                required
                placeholder="Country"
                className="border border-line px-3.5 py-3 text-sm focus-ring"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
              <input
                required
                placeholder="Phone"
                className="border border-line px-3.5 py-3 text-sm focus-ring sm:col-span-2"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium mb-4">Payment method</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 border px-4 py-3.5 cursor-pointer ${paymentMethod === "CARD" ? "border-ink" : "border-line"}`}>
                <input type="radio" name="pm" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} />
                <span className="text-sm">Card (Visa, Mastercard, Amex via Stripe)</span>
              </label>
              <label className={`flex items-center gap-3 border px-4 py-3.5 cursor-pointer ${paymentMethod === "COD" ? "border-ink" : "border-line"}`}>
                <input type="radio" name="pm" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                <span className="text-sm">Cash on delivery</span>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink text-cream py-4 text-sm tracking-wide hover:bg-clay transition-colors duration-300 disabled:opacity-50"
          >
            {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <div className="border hairline p-6 h-fit space-y-4">
          <h2 className="text-sm font-medium mb-2">Order summary</h2>
          <ul className="space-y-3">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-ink/70">
                  {item.product.name} × {item.quantity}
                </span>
                <span>{formatPrice(Number(item.product.price) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t hairline pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink/70">Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink/70">Shipping</span>
              <span>{SHIPPING === 0 ? "Free" : formatPrice(SHIPPING)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t hairline">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
