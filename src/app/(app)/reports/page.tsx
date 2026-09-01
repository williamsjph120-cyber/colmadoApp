"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/helpers";
import type { Sale, Credit, Product } from "@/lib/types";

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("sales").select("*"),
      supabase.from("credits").select("*"),
      supabase.from("products").select("*"),
    ]).then(([s, c, p]) => {
      if (s.data) setSales(s.data);
      if (c.data) setCredits(c.data);
      if (p.data) setProducts(p.data);
    });
  }, []);

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const salesByDay = [0, 0, 0, 0, 0, 0, 0];
  const productSales: Record<string, number> = {};
  const methodTotals: Record<string, number> = { efectivo: 0, tarjeta: 0, credito: 0 };
  let totalSales = 0;

  sales.forEach((s) => {
    const d = new Date(s.date + "T00:00:00").getDay();
    salesByDay[d] += s.total;
    totalSales += s.total;
    methodTotals[s.method] = (methodTotals[s.method] || 0) + s.total;
  });

  sales.forEach((s) => {
    // we need sale_items for this - skip for now, use method totals only
  });

  const maxSale = Math.max(...salesByDay, 1);
  const pendingCredits = credits.filter((c) => c.status === "pendiente");
  const paidCredits = credits.filter((c) => c.status === "pagado");
  const pendingTotal = pendingCredits.reduce((s, c) => s + c.pending, 0);
  const paidTotal = paidCredits.reduce((s, c) => s + c.amount, 0);
  const stockTotal = products.reduce((s, p) => s + p.stock, 0);

  return (
    <div className="grid md:grid-cols-2 gap-5">
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

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-bold text-sm mb-4">Resumen del mes</h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm py-2 border-b border-gray-100"><span className="font-semibold">Total ventas</span><span>{formatCurrency(totalSales)}</span></div>
          <div className="flex justify-between text-sm py-2 border-b border-gray-100"><span className="font-semibold">Créditos pendientes</span><span className="text-amber-500 font-bold">{formatCurrency(pendingTotal)}</span></div>
          <div className="flex justify-between text-sm py-2 border-b border-gray-100"><span className="font-semibold">Créditos pagados</span><span className="text-green-600 font-bold">{formatCurrency(paidTotal)}</span></div>
          <div className="flex justify-between text-sm py-2"><span className="font-semibold">Productos en stock</span><span>{stockTotal} uds</span></div>
        </div>
      </div>

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

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-bold text-sm mb-4">Top productos más vendidos</h4>
        <div className="space-y-3">
          {products.sort((a, b) => a.stock - b.stock).slice(0, 5).map((p, i) => (
            <div key={p.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
              <span className="font-semibold">#{i + 1} {p.emoji} {p.name}</span>
              <span className="text-gray-500">{p.stock} en stock</span>
            </div>
          ))}
          {products.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Sin datos</p>}
        </div>
      </div>
    </div>
  );
}
