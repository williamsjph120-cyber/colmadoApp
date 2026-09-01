"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/helpers";
import type { Product } from "@/lib/types";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "abarrotes", emoji: "📦", price: "", stock: "", min_stock: "5" });

  const load = () => supabase.from("products").select("*").order("name").then(({ data }) => { if (data) setProducts(data); });

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search.toLowerCase()));

  const openNew = () => { setEditId(null); setForm({ name: "", category: "abarrotes", emoji: "📦", price: "", stock: "", min_stock: "5" }); setModal(true); };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, category: p.category, emoji: p.emoji, price: String(p.price), stock: String(p.stock), min_stock: String(p.min_stock) });
    setModal(true);
  };

  const save = async () => {
    if (!form.name) return;
    const data = { name: form.name, category: form.category, emoji: form.emoji || "📦", price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0, min_stock: parseInt(form.min_stock) || 5 };
    if (editId) {
      await supabase.from("products").update(data).eq("id", editId);
    } else {
      await supabase.from("products").insert(data);
    }
    setModal(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="font-bold text-sm">Inventario ({products.length} productos)</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm flex-1 sm:w-52 focus:outline-none focus:border-teal-500" />
          <button onClick={openNew} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition whitespace-nowrap">+ Producto</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3">Precio</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = p.stock <= 0 ? "agotado" : p.stock <= p.min_stock ? "bajo" : "ok";
              return (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-semibold">{p.emoji} {p.name}</td>
                  <td className="px-5 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold">{p.category}</span></td>
                  <td className="px-5 py-3">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-3">{p.stock}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      status === "ok" ? "bg-green-100 text-green-700" : status === "bajo" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}>
                      {status === "ok" ? "Disponible" : status === "bajo" ? "Stock bajo" : "Agotado"}
                    </span>
                  </td>
                  <td className="px-5 py-3 space-x-1">
                    <button onClick={() => openEdit(p)} className="w-8 h-8 rounded border border-gray-200 text-sm hover:bg-gray-50 inline-flex items-center justify-center">✏️</button>
                    <button onClick={() => del(p.id)} className="w-8 h-8 rounded border border-red-200 text-sm hover:bg-red-50 inline-flex items-center justify-center">🗑️</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Sin productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold">{editId ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200">✕</button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Aceite 1L" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Categoría</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500">
                    {["abarrotes", "bebidas", "lacteos", "carnes", "limpieza", "higiene", "otros"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Emoji</label>
                  <input type="text" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Precio</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stock mín.</label>
                  <input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancelar</button>
              <button onClick={save} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
