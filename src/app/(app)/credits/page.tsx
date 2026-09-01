"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/helpers";
import type { Credit } from "@/lib/types";

let _s: any = null;
async function getS() { if (!_s) { const m = await import("@/lib/supabase"); _s = m.getSupabase(); } return _s; }

export default function CreditsPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [modal, setModal] = useState(false);
  const [abonoModal, setAbonoModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({ client: "", amount: "", concept: "" });
  const [abonoAmount, setAbonoAmount] = useState("");

  const load = async () => { const supabase = await getS(); const { data } = await supabase.from("credits").select("*").order("created_at", { ascending: false }); if (data) setCredits(data); };
  useEffect(() => { load(); }, []);

  const pending = credits.filter((c) => c.status === "pendiente");
  const paid = credits.filter((c) => c.status === "pagado");
  const pendingTotal = pending.reduce((s, c) => s + c.pending, 0);
  const paidTotal = paid.reduce((s, c) => s + c.amount, 0);

  const saveCredit = async () => {
    if (!form.client || !form.amount) return;
    const amount = parseFloat(form.amount);
    const supabase = await getS();
    await supabase.from("credits").insert({
      client: form.client, amount, paid: 0, pending: amount, status: "pendiente", concept: form.concept, date: new Date().toISOString().slice(0, 10),
    });
    setModal(false);
    setForm({ client: "", amount: "", concept: "" });
    load();
  };

  const openAbono = (c: Credit) => { setSelectedId(c.id); setAbonoAmount(""); setAbonoModal(true); };

  const applyAbono = async () => {
    const amount = parseFloat(abonoAmount);
    if (amount <= 0) return;
    const c = credits.find((x) => x.id === selectedId);
    if (!c || amount > c.pending) return;
    const newPaid = c.paid + amount;
    const newPending = c.pending - amount;
    const supabase = await getS();
    await supabase.from("credits").update({ paid: newPaid, pending: newPending, status: newPending <= 0 ? "pagado" : "pendiente" }).eq("id", selectedId);
    setAbonoModal(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Pendiente</p>
          <p className="text-2xl font-extrabold text-amber-500">{formatCurrency(pendingTotal)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Pagado</p>
          <p className="text-2xl font-extrabold text-green-600">{formatCurrency(paidTotal)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Deudores</p>
          <p className="text-2xl font-extrabold text-blue-600">{pending.length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-sm">Créditos</h3>
          <button onClick={() => { setForm({ client: "", amount: "", concept: "" }); setModal(true); }} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition">+ Nuevo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Pagado</th>
                <th className="px-5 py-3">Pendiente</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-5 py-3"><span className="font-semibold">{c.client}</span><br /><span className="text-[11px] text-gray-400">{c.concept || ""}</span></td>
                  <td className="px-5 py-3">{formatCurrency(c.amount)}</td>
                  <td className="px-5 py-3">{formatCurrency(c.paid)}</td>
                  <td className="px-5 py-3 font-bold" style={{ color: c.pending > 0 ? "#f59e0b" : "#22c55e" }}>{formatCurrency(c.pending)}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${c.status === "pagado" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span></td>
                  <td className="px-5 py-3">{c.status === "pendiente" && <button onClick={() => openAbono(c)} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700">Abonar</button>}</td>
                </tr>
              ))}
              {credits.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Sin créditos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-lg">Nuevo crédito</h2>
            <div><label className="block text-sm font-semibold mb-1">Cliente</label><input type="text" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" /></div>
            <div><label className="block text-sm font-semibold mb-1">Monto</label><input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" /></div>
            <div><label className="block text-sm font-semibold mb-1">Concepto</label><input type="text" value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancelar</button>
              <button onClick={saveCredit} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {abonoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-lg">Abonar</h2>
            <p className="text-sm text-gray-400">Pendiente: <strong className="text-amber-500">{formatCurrency(credits.find((c) => c.id === selectedId)?.pending || 0)}</strong></p>
            <div><label className="block text-sm font-semibold mb-1">Monto del abono</label><input type="number" step="0.01" value={abonoAmount} onChange={(e) => setAbonoAmount(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setAbonoModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancelar</button>
              <button onClick={applyAbono} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700">Abonar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
