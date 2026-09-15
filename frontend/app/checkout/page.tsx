"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useAuth } from "@/lib/store";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { CreditCard, Smartphone, Banknote, Lock } from "lucide-react";
import {
  detectBrand,
  formatCardNumber,
  formatExpiry,
  formatMobile,
  onlyDigits,
  luhnValid,
  cvcLength,
  expiryInFuture,
  validMobile,
} from "@/lib/card";

type PaymentMethod = "CARD" | "JAZZCASH" | "COD";

const METHODS: { value: PaymentMethod; label: string; hint: string; icon: React.ElementType }[] = [
  { value: "CARD", label: "Debit / Credit card", hint: "Visa, Mastercard, Amex", icon: CreditCard },
  { value: "JAZZCASH", label: "JazzCash", hint: "Pay from your mobile wallet", icon: Smartphone },
  { value: "COD", label: "Cash on delivery", hint: "Pay when it reaches your door", icon: Banknote },
];

const inputClass = "w-full border border-line px-3.5 py-3 text-sm focus-ring";

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [jazzCashNumber, setJazzCashNumber] = useState("");
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
  const cardDigits = onlyDigits(card.number);
  const brand = detectBrand(cardDigits);

  function validatePayment(): string | null {
    if (paymentMethod === "CARD") {
      if (!luhnValid(cardDigits)) return "That card number doesn't look right — please check it.";
      if (card.name.trim().length < 2) return "Enter the name printed on the card.";
      if (!expiryInFuture(card.expiry)) return "Enter a valid expiry date that hasn't passed.";
      if (onlyDigits(card.cvc).length !== cvcLength(brand)) {
        return `The security code should be ${cvcLength(brand)} digits for ${brand}.`;
      }
    }
    if (paymentMethod === "JAZZCASH" && !validMobile(jazzCashNumber)) {
      return "Enter a valid JazzCash mobile number, e.g. 0300-1234567.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validatePayment();
    if (problem) {
      setError(problem);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { paymentMethod, shippingAddress: form };
      // Only the brand and last four leave the browser — never the full number or CVC.
      if (paymentMethod === "CARD") {
        payload.card = { brand, last4: cardDigits.slice(-4) };
      }
      if (paymentMethod === "JAZZCASH") {
        payload.jazzCashNumber = onlyDigits(jazzCashNumber);
      }

      const res = await api.post<{ order: { orderNumber: string }; checkoutUrl: string | null }>(
        "/orders/checkout",
        payload
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
                className={`${inputClass} sm:col-span-2`}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <input
                required
                placeholder="Address line 1"
                className={`${inputClass} sm:col-span-2`}
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
              <input
                placeholder="Address line 2 (optional)"
                className={`${inputClass} sm:col-span-2`}
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
              <input
                required
                placeholder="City"
                className={inputClass}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                required
                placeholder="State / Province"
                className={inputClass}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <input
                required
                placeholder="Postal code"
                className={inputClass}
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              />
              <input
                required
                placeholder="Country"
                className={inputClass}
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
              <input
                required
                placeholder="Phone"
                className={`${inputClass} sm:col-span-2`}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium mb-4">Payment method</h2>
            <div className="space-y-3">
              {METHODS.map(({ value, label, hint, icon: Icon }) => {
                const active = paymentMethod === value;
                return (
                  <div key={value} className={`border transition-colors ${active ? "border-ink" : "border-line"}`}>
                    <label className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pm"
                        className="accent-ink"
                        checked={active}
                        onChange={() => {
                          setPaymentMethod(value);
                          setError("");
                        }}
                      />
                      <Icon size={18} strokeWidth={1.5} className={active ? "text-ink" : "text-ink/50"} />
                      <span className="min-w-0">
                        <span className="block text-sm">{label}</span>
                        <span className="block text-xs text-ink/50">{hint}</span>
                      </span>
                    </label>

                    {active && value === "CARD" && (
                      <div className="border-t hairline p-4 space-y-4 bg-cream/60">
                        <div>
                          <label className="block text-xs font-medium text-ink/60 mb-1.5">Card number</label>
                          <div className="relative">
                            <input
                              required
                              inputMode="numeric"
                              autoComplete="cc-number"
                              placeholder="1234 5678 9012 3456"
                              className={`${inputClass} pr-16`}
                              value={card.number}
                              onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                            />
                            {cardDigits.length >= 2 && brand !== "Card" && (
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-ink/60">
                                {brand}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-ink/60 mb-1.5">Name on card</label>
                          <input
                            required
                            autoComplete="cc-name"
                            placeholder="As printed on the card"
                            className={inputClass}
                            value={card.name}
                            onChange={(e) => setCard({ ...card, name: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-ink/60 mb-1.5">Expiry</label>
                            <input
                              required
                              inputMode="numeric"
                              autoComplete="cc-exp"
                              placeholder="MM/YY"
                              className={inputClass}
                              value={card.expiry}
                              onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink/60 mb-1.5">
                              Security code
                            </label>
                            <input
                              required
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              placeholder={brand === "Amex" ? "4 digits" : "3 digits"}
                              className={inputClass}
                              value={card.cvc}
                              onChange={(e) =>
                                setCard({ ...card, cvc: onlyDigits(e.target.value).slice(0, cvcLength(brand)) })
                              }
                            />
                          </div>
                        </div>

                        <p className="flex items-start gap-2 text-xs text-ink/50">
                          <Lock size={13} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                          Your card is checked in your browser. We only keep the brand and last four
                          digits — never the full number or security code.
                        </p>
                      </div>
                    )}

                    {active && value === "JAZZCASH" && (
                      <div className="border-t hairline p-4 space-y-3 bg-cream/60">
                        <div>
                          <label className="block text-xs font-medium text-ink/60 mb-1.5">
                            JazzCash mobile number
                          </label>
                          <input
                            required
                            inputMode="numeric"
                            autoComplete="tel-national"
                            placeholder="0300-1234567"
                            className={inputClass}
                            value={jazzCashNumber}
                            onChange={(e) => setJazzCashNumber(formatMobile(e.target.value))}
                          />
                        </div>
                        <p className="text-xs text-ink/50">
                          You'll get a payment request on this number to approve with your JazzCash
                          PIN. Your order ships once the payment clears.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
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
