"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminNav from "@/components/AdminNav";
import { api } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import { formatPrice } from "@/lib/format";

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
      <div className="mx-auto max-w-content px-5 md:px-10 py-14">
        <h1 className="font-display text-3xl md:text-4xl tracking-tightest mb-8">Admin dashboard</h1>
        <AdminNav />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium">Products ({products.length})</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-ink text-cream px-4 py-2 text-sm hover:bg-clay transition-colors duration-300"
          >
            {showForm ? "Cancel" : "Add product"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="border hairline p-6 mb-8 grid sm:grid-cols-2 gap-4">
            <input required placeholder="Name" className="border border-line px-3 py-2.5 text-sm focus-ring" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="SKU" className="border border-line px-3 py-2.5 text-sm focus-ring" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <textarea required placeholder="Description" className="border border-line px-3 py-2.5 text-sm focus-ring sm:col-span-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input required type="number" step="1" placeholder="Price (PKR)" className="border border-line px-3 py-2.5 text-sm focus-ring" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input type="number" step="1" placeholder="Compare-at price, PKR (optional)" className="border border-line px-3 py-2.5 text-sm focus-ring" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
            <input required type="number" placeholder="Stock" className="border border-line px-3 py-2.5 text-sm focus-ring" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <select required className="border border-line px-3 py-2.5 text-sm focus-ring" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required placeholder="Image URLs, comma separated" className="border border-line px-3 py-2.5 text-sm focus-ring sm:col-span-2" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
            <input placeholder="Sizes, comma separated (S, M, L)" className="border border-line px-3 py-2.5 text-sm focus-ring" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
            <input placeholder="Colors, comma separated" className="border border-line px-3 py-2.5 text-sm focus-ring" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
            <input placeholder="Material" className="border border-line px-3 py-2.5 text-sm focus-ring sm:col-span-2" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} /> New arrival</label>
            {error && <p className="text-sm text-clay sm:col-span-2">{error}</p>}
            <button disabled={submitting} className="sm:col-span-2 bg-ink text-cream py-3 text-sm hover:bg-clay transition-colors duration-300 disabled:opacity-50">
              {submitting ? "Saving…" : "Save product"}
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border hairline">
            <thead>
              <tr className="border-b hairline text-left text-ink/50">
                <th className="px-4 py-3 font-normal">Product</th>
                <th className="px-4 py-3 font-normal">SKU</th>
                <th className="px-4 py-3 font-normal">Price</th>
                <th className="px-4 py-3 font-normal">Stock</th>
                <th className="px-4 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-ink/60">{p.sku}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-clay text-xs underline underline-offset-4">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/50">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
