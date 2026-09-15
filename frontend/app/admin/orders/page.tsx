"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminShell from "@/components/AdminShell";
import StatusBadge from "@/components/StatusBadge";
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
      <AdminShell title="Orders" subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"} ${filter ? `· ${filter.toLowerCase()}` : ""}`}>
        <div className="flex items-center justify-end mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-line bg-cream text-sm px-3 py-2.5 focus-ring"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="animate-pulse bg-ink/5 h-96" />
        ) : (
          <div className="overflow-x-auto border hairline bg-cream">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b hairline text-left text-ink/50">
                  <th className="px-4 py-3.5 font-normal">Order</th>
                  <th className="px-4 py-3.5 font-normal">Customer</th>
                  <th className="px-4 py-3.5 font-normal">Payment</th>
                  <th className="px-4 py-3.5 font-normal">Total</th>
                  <th className="px-4 py-3.5 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-ink/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="text-xs text-ink/40">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p>{o.user?.name}</p>
                      <p className="text-xs text-ink/40">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-ink/70">
                      <p>{o.paymentMethod} · {o.paymentStatus}</p>
                      {o.cardLast4 && (
                        <p className="text-xs text-ink/40">{o.cardBrand} ···· {o.cardLast4}</p>
                      )}
                      {o.walletNumber && <p className="text-xs text-ink/40">{o.walletNumber}</p>}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={o.status} />
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="border border-line text-xs px-2 py-1.5 focus-ring bg-cream"
                          aria-label={`Update status for order ${o.orderNumber}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-ink/50">No orders match this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}
