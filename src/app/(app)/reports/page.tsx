"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/helpers";
import type { Sale, SaleItem, Credit, Product } from "@/lib/types";

let _s: any = null;
async function getS() { if (!_s) { const m = await import("@/lib/supabase"); _s = m.getSupabase(); } return _s; }
async function getUserId() { const m = await import("@/lib/supabase"); return m.getCurrentUserId(); }

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [filter, setFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    getUserId().then((uid) => {
      setUserId(uid);
      getS().then((supabase) =>
        Promise.all([
          supabase.from("sales").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase.from("credits").select("*").eq("user_id", uid),
          supabase.from("products").select("*").eq("user_id", uid),
        ]).then(([s, c, p]) => {
          if (s.data) setSales(s.data);
          if (c.data) setCredits(c.data);
          if (p.data) setProducts(p.data);
        })
      );
    });
  }, []);

  // Analytics
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const salesByDay = [0, 0, 0, 0, 0, 0, 0];
  const methodTotals: Record<string, number> = { efectivo: 0, tarjeta: 0, credito: 0 };
  let totalSales = 0;

  const alcoholProducts = new Set(products.filter((p) => p.category === "alcohol").map((p) => p.id));
  let alcoholTotal = 0;

  sales.forEach((s) => {
    const d = new Date(s.date + "T00:00:00").getDay();
    salesByDay[d] += s.total;
    totalSales += s.total;
    methodTotals[s.method] = (methodTotals[s.method] || 0) + s.total;
  });

  // Calculate alcohol sales from sale_items
  const [alcoholSalesTotal, setAlcoholSalesTotal] = useState(0);
  const [alcoholSalesCount, setAlcoholSalesCount] = useState(0);

  useEffect(() => {
    if (!userId || sales.length === 0) return;
    const loadAlcohol = async () => {
      const supabase = await getS();
      const saleIds = sales.map((s) => s.id);
      if (saleIds.length === 0) return;
      const { data: items } = await supabase.from("sale_items").select("*").in("sale_id", saleIds);
      if (!items) return;
      let total = 0;
      let count = 0;
      items.forEach((item: any) => {
        if (alcoholProducts.has(item.product_id)) {
          total += item.price * item.qty;
          count++;
        }
      });
      setAlcoholSalesTotal(total);
      setAlcoholSalesCount(count);
    };
    loadAlcohol();
  }, [userId, sales, products]);

  const maxSale = Math.max(...salesByDay, 1);
  const pendingCredits = credits.filter((c) => c.status === "pendiente");
  const paidCredits = credits.filter((c) => c.status === "pagado");
  const pendingTotal = pendingCredits.reduce((s, c) => s + c.pending, 0);
  const paidTotal = paidCredits.reduce((s, c) => s + c.amount, 0);
  const stockTotal = products.reduce((s, p) => s + p.stock, 0);

  // Sales history
  const filtered = sales.filter((s) => {
    if (filter !== "todos" && s.method !== filter) return false;
    if (dateFrom && s.date < dateFrom) return false;
    if (dateTo && s.date > dateTo) return false;
    return true;
  });
  const totalFiltered = filtered.reduce((sum, s) => sum + s.total, 0);

  const openSaleDetails = async (sale: Sale) => {
    setSelectedSale(sale);
    setLoadingItems(true);
    const supabase = await getS();
    const { data } = await supabase.from("sale_items").select("*").eq("sale_id", sale.id);
    if (data) setSaleItems(data);
    setLoadingItems(false);
  };

  const methodLabel = (m: string) => m === "efectivo" ? "💵 Efectivo" : m === "tarjeta" ? "💳 Tarjeta" : "📝 Crédito";
  const methodColor = (m: string) => m === "efectivo" ? "bg-green-100 text-green-700" : m === "tarjeta" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";

  return (
    <div className="space-y-6">
      {/* Analytics Section */}
      <div>
        <h2 className="text-lg font-bold mb-4">Resumen</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {/* Ventas por día */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="font-bold text-sm mb-4">Ventas por día</h4>
            <div className="flex items-end gap-3 h-40">
              {salesByDay.map((val, i) => (
                <div key={i} className="flex-1 relative" style={{ height: `${Math.max(8, (val / maxSale) * 100)}%` }}>
                  <div className="absolute inset-0 bg-teal-600 rounded-t-md hover:bg-amber-500 transition" />
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold">${val.toFixed(0)}</div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">{days[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen del mes */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="font-bold text-sm mb-4">Resumen del mes</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-gray-100"><span className="font-semibold">Total ventas</span><span>{formatCurrency(totalSales)}</span></div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100"><span className="font-semibold">Créditos pendientes</span><span className="text-amber-500 font-bold">{formatCurrency(pendingTotal)}</span></div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100"><span className="font-semibold">Créditos pagados</span><span className="text-green-600 font-bold">{formatCurrency(paidTotal)}</span></div>
              <div className="flex justify-between text-sm py-2"><span className="font-semibold">Productos en stock</span><span>{stockTotal} uds</span></div>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="font-bold text-sm mb-4">Métodos de pago</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                <span className="font-semibold">💵 Efectivo</span><span className="text-green-600 font-bold">{formatCurrency(methodTotals.efectivo || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                <span className="font-semibold">💳 Tarjeta</span><span className="text-blue-600 font-bold">{formatCurrency(methodTotals.tarjeta || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2">
                <span className="font-semibold">📝 Crédito</span><span className="text-amber-500 font-bold">{formatCurrency(methodTotals.credito || 0)}</span>
              </div>
            </div>
          </div>

          {/* Alcohol */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="font-bold text-sm mb-4">🍺 Alcohol</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="font-semibold">Productos alcohol</span><span>{products.filter((p) => p.category === "alcohol").length}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="font-semibold">Items vendidos</span><span>{alcoholSalesCount}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="font-semibold">Total vendido</span><span className="font-bold text-amber-600">{formatCurrency(alcoholSalesTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales History Section */}
      <div>
        <h2 className="text-lg font-bold mb-4">Historial de Ventas</h2>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <p className="text-sm text-gray-400">{filtered.length} ventas — Total: {formatCurrency(totalFiltered)}</p>
          <div className="flex gap-2 flex-wrap">
            {["todos", "efectivo", "tarjeta", "credito"].map((m) => (
              <button key={m} onClick={() => setFilter(m)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${filter === m ? "bg-teal-600 text-white border-teal-600" : "bg-white border-gray-200 text-gray-600 hover:border-teal-500"}`}>
                {m === "todos" ? "Todos" : m === "credito" ? "Crédito" : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap mb-4">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Desde</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Hasta</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="self-end px-3 py-1.5 text-xs text-red-500 font-semibold hover:text-red-700">Limpiar</button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Método</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3 text-right">Subtotal</th>
                  <th className="px-5 py-3 text-right">ITBIS</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => openSaleDetails(s)}>
                    <td className="px-5 py-3 text-xs">{new Date(s.created_at).toLocaleDateString("es-DO")}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${methodColor(s.method)}`}>{methodLabel(s.method)}</span></td>
                    <td className="px-5 py-3 text-xs">{s.client_name || "—"}</td>
                    <td className="px-5 py-3 text-right text-xs">{formatCurrency(s.subtotal)}</td>
                    <td className="px-5 py-3 text-right text-xs text-gray-400">{formatCurrency(s.tax)}</td>
                    <td className="px-5 py-3 text-right text-xs font-bold">{formatCurrency(s.total)}</td>
                    <td className="px-5 py-3"><button className="text-teal-600 text-xs font-semibold hover:underline">Ver</button></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Sin ventas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSale(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Detalle de Venta</h2>
              <button onClick={() => setSelectedSale(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200">✕</button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Fecha:</span><span className="font-semibold">{new Date(selectedSale.created_at).toLocaleString("es-DO")}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Método:</span><span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${methodColor(selectedSale.method)}`}>{methodLabel(selectedSale.method)}</span></div>
              {selectedSale.client_name && <div className="flex justify-between"><span className="text-gray-400">Cliente:</span><span className="font-semibold">{selectedSale.client_name}</span></div>}
              {selectedSale.concept && <div className="flex justify-between"><span className="text-gray-400">Concepto:</span><span className="font-semibold">{selectedSale.concept}</span></div>}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <h3 className="font-bold text-xs text-gray-400 uppercase mb-2">Productos</h3>
              {loadingItems ? (
                <div className="flex justify-center py-4"><div className="animate-spin w-6 h-6 border-4 border-teal-600 border-t-transparent rounded-full" /></div>
              ) : saleItems.length > 0 ? (
                <div className="space-y-2">
                  {saleItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                      <span>{item.product_emoji} {item.product_name} x{item.qty}</span>
                      <span className="font-bold">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">Sin detalles disponibles</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>{formatCurrency(selectedSale.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">ITBIS (18%)</span><span>{formatCurrency(selectedSale.tax)}</span></div>
              <div className="flex justify-between text-lg font-extrabold text-teal-700"><span>Total</span><span>{formatCurrency(selectedSale.total)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
