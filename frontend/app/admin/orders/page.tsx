"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const qs = filter ? `?status=${filter}` : "";
    const data = await api.get<{ orders: Order[] }>(`/admin/orders${qs}`);
    setOrders(data.orders);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    await api.patch(`/admin/orders/${id}/status`, { status });
    load();
  }

  return (
    <AdminGuard>
      <div className="mx-auto max-w-content px-5 md:px-10 py-14">
        <h1 className="font-display text-3xl md:text-4xl tracking-tightest mb-8">Admin dashboard</h1>
        <AdminNav />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium">Orders</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-line text-sm px-3 py-2 focus-ring"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-ink/50">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border hairline">
              <thead>
                <tr className="border-b hairline text-left text-ink/50">
                  <th className="px-4 py-3 font-normal">Order</th>
                  <th className="px-4 py-3 font-normal">Customer</th>
                  <th className="px-4 py-3 font-normal">Payment</th>
                  <th className="px-4 py-3 font-normal">Total</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <p>{o.orderNumber}</p>
                      <p className="text-xs text-ink/40">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{o.user?.name}</p>
                      <p className="text-xs text-ink/40">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">{o.paymentMethod} · {o.paymentStatus}</td>
                    <td className="px-4 py-3">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="border border-line text-sm px-2 py-1.5 focus-ring"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink/50">No orders match this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
