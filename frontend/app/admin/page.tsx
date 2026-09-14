"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import AdminShell from "@/components/AdminShell";
import RevenueChart from "@/components/RevenueChart";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { Wallet, ShoppingBag, Package, Users, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

interface Stats {
  productCount: number;
  orderCount: number;
  userCount: number;
  revenue: number;
  revenueSeries: { date: string; total: number }[];
  lowStock: { id: string; name: string; stock: number }[];
  recentOrders: { id: string; orderNumber: string; total: string; status: string; user: { name: string } }[];
}

function revenueTrend(series: { date: string; total: number }[]) {
  if (series.length < 2) return null;
  const mid = Math.ceil(series.length / 2);
  const prior = series.slice(0, mid);
  const recent = series.slice(mid);
  if (recent.length === 0 || prior.length === 0) return null;
  const priorSum = prior.reduce((s, d) => s + d.total, 0);
  const recentSum = recent.reduce((s, d) => s + d.total, 0);
  if (priorSum === 0) return null;
  return Math.round(((recentSum - priorSum) / priorSum) * 100);
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: number | null;
}) {
  return (
    <div className="border hairline bg-cream p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 flex items-center justify-center bg-ink text-cream">
          <Icon size={18} strokeWidth={1.5} />
        </div>
        {typeof trend === "number" && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-moss" : "text-clay"}`}
          >
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-ink/50">{label}</p>
        <p className="font-display text-3xl tracking-tightest mt-1">{value}</p>
      </div>
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-ink/5 ${className}`} />;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/admin/stats").then(setStats).catch(() => setStats(null));
  }, []);

  const trend = stats ? revenueTrend(stats.revenueSeries) : null;

  return (
    <AdminGuard>
      <AdminShell title="Dashboard" subtitle="Here's what's happening with your store today.">
        {!stats ? (
          <div className="space-y-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-32" />
              ))}
            </div>
            <SkeletonBlock className="h-64" />
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Revenue (paid orders)" value={formatPrice(stats.revenue)} icon={Wallet} trend={trend} />
              <StatCard label="Orders" value={stats.orderCount.toString()} icon={ShoppingBag} />
              <StatCard label="Products" value={stats.productCount.toString()} icon={Package} />
              <StatCard label="Customers" value={stats.userCount.toString()} icon={Users} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium">Revenue, last {stats.revenueSeries.length} days with sales</h2>
              </div>
              <div className="border hairline bg-cream p-6">
                <RevenueChart data={stats.revenueSeries} />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium">Recent orders</h2>
                  <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-ink/50 hover:text-ink transition-colors">
                    View all <ArrowUpRight size={13} />
                  </Link>
                </div>
                <ul className="border hairline bg-cream divide-y hairline">
                  {stats.recentOrders.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm">
                      <div className="min-w-0">
                        <p className="truncate">{o.orderNumber}</p>
                        <p className="text-xs text-ink/40 truncate">{o.user?.name}</p>
                      </div>
                      <StatusBadge status={o.status} />
                      <span className="shrink-0 font-medium">{formatPrice(o.total)}</span>
                    </li>
                  ))}
                  {stats.recentOrders.length === 0 && (
                    <li className="px-4 py-8 text-center text-sm text-ink/50">No orders yet.</li>
                  )}
                </ul>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium">Low stock</h2>
                  <Link href="/admin/products" className="flex items-center gap-1 text-xs text-ink/50 hover:text-ink transition-colors">
                    Manage <ArrowUpRight size={13} />
                  </Link>
                </div>
                <ul className="border hairline bg-cream divide-y hairline">
                  {stats.lowStock.map((p) => (
                    <li key={p.id} className="flex items-center justify-between px-4 py-3.5 text-sm">
                      <span className="truncate">{p.name}</span>
                      <span className="shrink-0 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide bg-clay/15 text-clay">
                        {p.stock} left
                      </span>
                    </li>
                  ))}
                  {stats.lowStock.length === 0 && (
                    <li className="px-4 py-8 text-center text-sm text-ink/50">Everything is well stocked.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}
