"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/helpers";
import type { Product } from "@/lib/types";

let _supabase: any = null;
async function getS() { if (!_supabase) { const m = await import("@/lib/supabase"); _supabase = m.getSupabase(); } return _supabase; }
async function getUserId() { const m = await import("@/lib/supabase"); return m.getCurrentUserId(); }

const CATEGORIES = [
  { id: "abarrotes", label: "Abarrotes", icon: "🏪" },
  { id: "bebidas", label: "Bebidas", icon: "🥤" },
  { id: "lacteos", label: "Lácteos", icon: "🥛" },
  { id: "carnes", label: "Carnes", icon: "🍗" },
  { id: "frutas", label: "Frutas y Verduras", icon: "🥬" },
  { id: "limpieza", label: "Limpieza", icon: "🧹" },
  { id: "higiene", label: "Higiene", icon: "🪥" },
  { id: "snacks", label: "Snacks", icon: "🍿" },
  { id: "otros", label: "Otros", icon: "📦" },
];

const UNITS = [
  { id: "unidad", label: "Unidad", short: "und" },
  { id: "litro", label: "Litro", short: "L" },
  { id: "onzas", label: "Onzas", short: "oz" },
  { id: "kilogramo", label: "Kilogramo", short: "kg" },
  { id: "libra", label: "Libra", short: "lb" },
  { id: "paquete", label: "Paquete", short: "pqte" },
  { id: "caja", label: "Caja", short: "cj" },
  { id: "docena", label: "Docena", short: "doc" },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  abarrotes: "🏪", bebidas: "🥤", lacteos: "🥛", carnes: "🍗",
  frutas: "🥬", limpieza: "🧹", higiene: "🪥", snacks: "🍿", otros: "📦",
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "abarrotes", unit: "unidad", emoji: "", price: "", stock: "", min_stock: "5" });
  const [userId, setUserId] = useState("");

  const load = async (uid?: string) => { const id = uid || userId; if (!id) return; const supabase = await getS(); const { data } = await supabase.from("products").select("*").eq("user_id", id).order("name"); if (data) setProducts(data); };
  useEffect(() => { getUserId().then((id) => { setUserId(id); load(id); }); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search.toLowerCase()));

  const openNew = () => { setEditId(null); setForm({ name: "", category: "abarrotes", unit: "unidad", emoji: "", price: "", stock: "", min_stock: "5" }); setModal(true); };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, category: p.category, unit: p.unit || "unidad", emoji: p.emoji, price: String(p.price), stock: String(p.stock), min_stock: String(p.min_stock) });
    setModal(true);
  };

  const save = async () => {
    if (!form.name) return;
    const supabase = await getS();
    const emoji = form.emoji || CATEGORY_EMOJIS[form.category] || "📦";
    const data = { user_id: userId, name: form.name, category: form.category, unit: form.unit, emoji, price: parseFloat(form.price) || 0, stock: parseFloat(form.stock) || 0, min_stock: parseInt(form.min_stock) || 5 };
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
    const supabase = await getS();
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-sm">Inventario ({products.length} productos)</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm flex-1 sm:w-64 focus:outline-none focus:border-teal-500" />
            <button onClick={openNew} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition whitespace-nowrap">+ Nuevo</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Unidad</th>
                <th className="px-5 py-3">Precio</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const status = p.stock <= 0 ? "agotado" : p.stock <= p.min_stock ? "bajo" : "ok";
                const unitLabel = UNITS.find((u) => u.id === p.unit)?.short || "und";
                return (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-5 py-3 font-semibold">{p.emoji} {p.name}</td>
                    <td className="px-5 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold">{p.category}</span></td>
                    <td className="px-5 py-3 text-xs text-gray-500">{unitLabel}</td>
                    <td className="px-5 py-3">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-3">{p.stock} {unitLabel}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        status === "ok" ? "bg-green-100 text-green-700" : status === "bajo" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>
                        {status === "ok" ? "Disponible" : status === "bajo" ? "Stock bajo" : "Agotado"}
                      </span>
                    </td>
                    <td className="px-5 py-3 space-x-1">
                      <button onClick={() => openEdit(p)} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded hover:bg-gray-200">Editar</button>
                      <button onClick={() => del(p.id)} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded hover:bg-red-100">Eliminar</button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                  {search ? "No se encontraron productos" : "Sin productos — agrega uno nuevo"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">{editId ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200">✕</button>
            </div>
            <div className="p-6 space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Nombre del producto *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Coca-Cola 2L, Aceite 1L, Arroz 1kg" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition" autoFocus />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} type="button" onClick={() => setForm({ ...form, category: c.id })} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-semibold transition ${form.category === c.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 hover:border-gray-300"}`}>
                      <span>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unidad de medida */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Unidad de medida</label>
                <div className="grid grid-cols-4 gap-2">
                  {UNITS.map((u) => (
                    <button key={u.id} type="button" onClick={() => setForm({ ...form, unit: u.id })} className={`px-3 py-2 rounded-xl border-2 text-xs font-semibold transition text-center ${form.unit === u.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 hover:border-gray-300"}`}>
                      <div>{u.short}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{u.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Precio (RD$) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Stock actual</label>
                  <input type="number" step="0.01" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Stock mínimo</label>
                  <input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} placeholder="5" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancelar</button>
              <button onClick={save} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition">{editId ? "Guardar cambios" : "Agregar producto"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
