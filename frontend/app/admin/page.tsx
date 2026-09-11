"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";

interface Stats {
  productCount: number;
  orderCount: number;
  userCount: number;
  revenue: number;
  revenueSeries: { date: string; total: number }[];
  lowStock: { id: string; name: string; stock: number }[];
  recentOrders: { id: string; orderNumber: string; total: string; status: string; user: { name: string } }[];
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border hairline p-6">
      <p className="text-sm text-ink/50">{label}</p>
      <p className="font-display text-3xl tracking-tightest mt-2">{value}</p>
    </div>
  );
}

function RevenueChart({ data }: { data: { date: string; total: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-ink/50">No paid orders yet.</p>;
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full bg-moss"
            style={{ height: `${Math.max((d.total / max) * 100, 3)}%` }}
            title={`${d.date}: ${formatPrice(d.total)}`}
          />
          <span className="text-[10px] text-ink/40 rotate-0">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/admin/stats").then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <AdminGuard>
      <div className="mx-auto max-w-content px-5 md:px-10 py-14">
        <h1 className="font-display text-3xl md:text-4xl tracking-tightest mb-8">Admin dashboard</h1>
        <AdminNav />

        {!stats ? (
          <p className="text-sm text-ink/50">Loading…</p>
        ) : (
          <div className="space-y-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Revenue (paid orders)" value={formatPrice(stats.revenue)} />
              <StatCard label="Orders" value={stats.orderCount.toString()} />
              <StatCard label="Products" value={stats.productCount.toString()} />
              <StatCard label="Customers" value={stats.userCount.toString()} />
            </div>

            <div>
              <h2 className="text-sm font-medium mb-4">Revenue, last 14 days with sales</h2>
              <div className="border hairline p-6">
                <RevenueChart data={stats.revenueSeries} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-sm font-medium mb-4">Recent orders</h2>
                <ul className="divide-y hairline border hairline">
                  {stats.recentOrders.map((o) => (
                    <li key={o.id} className="flex justify-between px-4 py-3 text-sm">
                      <span>{o.orderNumber}</span>
                      <span className="text-ink/60">{o.status}</span>
                      <span>{formatPrice(o.total)}</span>
                    </li>
                  ))}
                  {stats.recentOrders.length === 0 && (
                    <li className="px-4 py-3 text-sm text-ink/50">No orders yet.</li>
                  )}
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-medium mb-4">Low stock</h2>
                <ul className="divide-y hairline border hairline">
                  {stats.lowStock.map((p) => (
                    <li key={p.id} className="flex justify-between px-4 py-3 text-sm">
                      <span>{p.name}</span>
                      <span className="text-clay">{p.stock} left</span>
                    </li>
                  ))}
                  {stats.lowStock.length === 0 && (
                    <li className="px-4 py-3 text-sm text-ink/50">Everything is well stocked.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
