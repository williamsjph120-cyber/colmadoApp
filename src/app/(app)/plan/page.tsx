"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/helpers";
import type { Subscription } from "@/lib/types";

let _s: any = null;
async function getS() { if (!_s) { const m = await import("@/lib/supabase"); _s = m.getSupabase(); } return _s; }

const PLANS = [
  { id: "gratis", name: "Gratis", price: 0, features: ["Hasta 50 productos", "Inventario básico", "POS simple", "Reportes básicos"] },
  { id: "basico", name: "Básico", price: 1000, features: ["Productos ilimitados", "POS completo", "Créditos/Fiado", "Reportes avanzados", "Soporte por WhatsApp"] },
  { id: "premium", name: "Premium", price: 1600, features: ["Todo lo del Básico", "Multi-usuario", "Reportes avanzados", "Soporte prioritario", "Actualizaciones gratis"] },
];

const BANK_INFO = {
  banco: "Banco Popular Dominicano",
  titular: "ColmadoApp S.R.L.",
  cuenta: "1234567890123",
  tipo: "Cuenta de Ahorro",
  cedula: "001-1234567-8",
};

export default function PlanPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getS().then((supabase) => {
      supabase.auth.getUser().then(({ data: { user } }: any) => {
        if (user) {
          supabase.from("subscriptions").select("*").eq("user_id", user.id).single().then(({ data }: any) => {
            setSub(data);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    });
  }, []);

  const currentPlan = sub?.plan || "gratis";

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-2">Tu plan actual</h3>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-extrabold text-teal-600 capitalize">{currentPlan}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sub?.status === "activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {sub?.status || "activo"}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`bg-white border-2 rounded-xl p-6 transition ${currentPlan === plan.id ? "border-teal-500 shadow-lg" : "border-gray-200 hover:border-teal-300"}`}>
            {currentPlan === plan.id && <div className="text-xs font-bold text-teal-600 mb-2">PLAN ACTUAL</div>}
            <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
            <div className="text-3xl font-extrabold text-teal-700 mb-4">
              {plan.price === 0 ? "Gratis" : <>{formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-400">/mes</span></>}
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">Upgrade por transferencia bancaria</h3>
        <p className="text-sm text-gray-500 mb-4">Haz una transferencia con los datos de abajo y envía el comprobante por WhatsApp al +1-809-555-0123</p>
        <div className="bg-gray-50 rounded-xl p-5 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Banco:</span><span className="font-semibold">{BANK_INFO.banco}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Titular:</span><span className="font-semibold">{BANK_INFO.titular}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Cédula/RNC:</span><span className="font-semibold">{BANK_INFO.cedula}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Tipo de cuenta:</span><span className="font-semibold">{BANK_INFO.tipo}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">N.° de cuenta:</span><span className="font-mono font-bold text-lg text-teal-700">{BANK_INFO.cuenta}</span></div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Una vez verificado tu pago, activaremos tu plan en menos de 24 horas.</p>
      </div>
    </div>
  );
}
