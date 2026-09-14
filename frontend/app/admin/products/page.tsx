"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminGuard from "@/components/AdminGuard";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Plus, X, Trash2 } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  images: "",
  sizes: "",
  colors: "",
  material: "",
  stock: "",
  sku: "",
  categoryId: "",
  featured: false,
  isNewArrival: false,
};

const LOW_STOCK_THRESHOLD = 5;

const inputClass = "w-full border border-line bg-cream px-3.5 py-2.5 text-sm focus-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink/60 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [p, c] = await Promise.all([
      api.get<{ items: Product[] }>("/products?limit=48"),
      api.get<{ categories: Category[] }>("/products/categories"),
    ]);
    setProducts(p.items);
    setCategories(c.categories);
    if (!form.categoryId && c.categories[0]) setForm((f) => ({ ...f, categoryId: c.categories[0].id }));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/products", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
        material: form.material || undefined,
        stock: Number(form.stock),
        sku: form.sku,
        categoryId: form.categoryId,
        featured: form.featured,
        isNewArrival: form.isNewArrival,
      });
      setForm({ ...emptyForm, categoryId: form.categoryId });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.message ?? "Couldn't create the product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This can't be undone.")) return;
    await api.delete(`/products/${id}`);
    load();
  }

  return (
    <AdminGuard>
      <AdminShell title="Products" subtitle={`${products.length} product${products.length === 1 ? "" : "s"} in your catalog`}>
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-ink text-cream px-4 py-2.5 text-sm hover:bg-clay transition-colors duration-300"
          >
            {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
            {showForm ? "Cancel" : "Add product"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="border hairline bg-cream p-6 md:p-8 mb-8">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Name"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="SKU"><input required className={inputClass} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
              <div className="sm:col-span-2">
                <Field label="Description"><textarea required className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
              </div>
              <Field label="Price (PKR)"><input required type="number" step="1" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
              <Field label="Compare-at price, PKR (optional)"><input type="number" step="1" className={inputClass} value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} /></Field>
              <Field label="Stock"><input required type="number" className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
              <Field label="Category">
                <select required className={inputClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Image URLs, comma separated"><input required className={inputClass} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} /></Field>
              </div>
              <Field label="Sizes, comma separated (S, M, L)"><input className={inputClass} value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} /></Field>
              <Field label="Colors, comma separated"><input className={inputClass} value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} /></Field>
              <div className="sm:col-span-2">
                <Field label="Material"><input className={inputClass} value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></Field>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} /> New arrival</label>
            </div>
            {error && <p className="text-sm text-clay mt-5">{error}</p>}
            <button disabled={submitting} className="w-full mt-6 bg-ink text-cream py-3 text-sm hover:bg-clay transition-colors duration-300 disabled:opacity-50">
              {submitting ? "Saving…" : "Save product"}
            </button>
          </form>
        )}

        <div className="overflow-x-auto border hairline bg-cream">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b hairline text-left text-ink/50">
                <th className="px-4 py-3.5 font-normal">Product</th>
                <th className="px-4 py-3.5 font-normal">SKU</th>
                <th className="px-4 py-3.5 font-normal">Price</th>
                <th className="px-4 py-3.5 font-normal">Stock</th>
                <th className="px-4 py-3.5 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-ink/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 shrink-0 bg-paper overflow-hidden">
                        {p.images?.[0] && (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="44px" />
                        )}
                      </div>
                      <span className="truncate max-w-[220px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{p.sku}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    {p.stock <= LOW_STOCK_THRESHOLD ? (
                      <span className="px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide bg-clay/15 text-clay">
                        {p.stock} left
                      </span>
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="inline-flex items-center gap-1.5 text-clay text-xs hover:underline underline-offset-4"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-ink/50">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
