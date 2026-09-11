"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const statusColor: Record<string, string> = {
  PENDING: "bg-sand text-ink",
  PAID: "bg-moss text-cream",
  PROCESSING: "bg-moss text-cream",
  SHIPPED: "bg-ink text-cream",
  DELIVERED: "bg-moss text-cream",
  CANCELLED: "bg-clay text-cream",
  REFUNDED: "bg-clay text-cream",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api.get<{ orders: Order[] }>("/orders").then((d) => setOrders(d.orders)).catch(() => setOrders([]));
  }, []);

  return (
    <div className="mx-auto max-w-content px-5 md:px-10 py-14">
      <h1 className="font-display text-3xl md:text-4xl tracking-tightest mb-10">Order history</h1>

      {orders === null ? (
        <p className="text-ink/60 text-sm">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink/60 mb-4">You haven't placed any orders yet.</p>
          <Link href="/shop" className="underline underline-offset-4 text-sm">Start shopping</Link>
        </div>
      ) : (
        <ul className="divide-y hairline">
          {orders.map((o) => (
            <li key={o.id} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-ink/60 mt-1">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2.5 py-1 ${statusColor[o.status] ?? "bg-sand"}`}>{o.status}</span>
                <span className="text-sm font-medium">{formatPrice(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
