"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate, getLocalDate } from "@/lib/helpers";
import type { Sale, Credit, Product } from "@/lib/types";

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    import("@/lib/supabase").then(({ getSupabase, getCurrentUserId }) => {
      getCurrentUserId().then((userId) => {
        const supabase = getSupabase();
        Promise.all([
          supabase.from("sales").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
          supabase.from("credits").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
          supabase.from("products").select("*").eq("user_id", userId),
        ]).then(([salesRes, creditsRes, productsRes]) => {
          if (salesRes.data) setSales(salesRes.data);
          if (creditsRes.data) setCredits(creditsRes.data);
          if (productsRes.data) setProducts(productsRes.data);
        });
      });
    });
  }, []);

  const today = getLocalDate();
  const todaySales = sales.filter((s) => s.date === today);
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const pendingCredits = credits.filter((c) => c.status === "pendiente");
  const pendingTotal = pendingCredits.reduce((sum, c) => sum + c.pending, 0);
  const lowStock = products.filter((p) => p.stock <= p.min_stock);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Ventas hoy</p>
          <p className="text-3xl font-extrabold text-green-600">{formatCurrency(todayTotal)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Productos</p>
          <p className="text-3xl font-extrabold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Créditos pendientes</p>
          <p className="text-3xl font-extrabold text-amber-500">{formatCurrency(pendingTotal)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Stock bajo</p>
          <p className="text-3xl font-extrabold text-red-500">{lowStock.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-sm">Ventas recientes</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Método</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 5).map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-5 py-3">{formatDate(s.date)}</td>
                  <td className="px-5 py-3 font-bold">{formatCurrency(s.total)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                      s.method === "efectivo" ? "bg-green-100 text-green-700" :
                      s.method === "tarjeta" ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {s.method}
                    </span>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">Sin ventas aún</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-sm">Créditos recientes</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Pendiente</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {credits.slice(0, 5).map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-semibold">{c.client}</td>
                  <td className="px-5 py-3 font-bold text-amber-500">{formatCurrency(c.pending)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                      c.status === "pagado" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {credits.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">Sin créditos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
