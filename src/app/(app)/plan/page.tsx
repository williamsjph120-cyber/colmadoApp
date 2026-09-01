"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/helpers";
import type { Subscription } from "@/lib/types";

let _s: any = null;
async function getS() { if (!_s) { const m = await import("@/lib/supabase"); _s = m.getSupabase(); } return _s; }

const PLANS = [
  { id: "basico", name: "Básico", price: 500, features: ["Productos ilimitados", "POS completo", "Créditos/Fiado", "Reportes básicos", "Soporte por WhatsApp"] },
  { id: "estandar", name: "Estándar", price: 800, features: ["Todo lo del Básico", "Reportes avanzados", "Historial de ventas", "Soporte prioritario"] },
  { id: "premium", name: "Premium", price: 1200, features: ["Todo lo del Estándar", "Multi-usuario", "Inventario avanzado", "Actualizaciones gratis", "Soporte 24/7"] },
];

const BANK_INFO = {
  banco: "Banco Popular Dominicano",
  titular: "Williams Perdomo",
  cuenta: "855449823",
  tipo: "Cuenta Corriente",
  pasaporte: "200793090",
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

  const currentPlan = sub?.plan || "basico";
  const isActive = sub?.status === "activo" || sub?.status === "trial";
  const expiresAt = sub?.expires_at ? new Date(sub.expires_at) : null;
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  const isTrial = sub?.status === "trial";

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Current plan */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-2">Tu plan actual</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-3xl font-extrabold text-teal-600 capitalize">{sub?.plan === "estandar" ? "Estándar" : sub?.plan === "premium" ? "Premium" : "Básico"}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {isTrial ? "Trial" : sub?.status || "activo"}
          </span>
          {expiresAt && (
            <span className={`text-sm font-semibold ${daysLeft <= 7 ? "text-red-500" : "text-gray-500"}`}>
              {daysLeft > 0 ? `${daysLeft} días restantes` : "Expirado"}
            </span>
          )}
        </div>
        {isTrial && expiresAt && (
          <p className="text-sm text-gray-400 mt-2">Tu trial gratuito vence el {expiresAt.toLocaleDateString("es-DO")}. Después necesitarás pagar para seguir usando la app.</p>
        )}
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`bg-white border-2 rounded-xl p-6 transition ${currentPlan === plan.id ? "border-teal-500 shadow-lg" : "border-gray-200 hover:border-teal-300"}`}>
            {currentPlan === plan.id && <div className="text-xs font-bold text-teal-600 mb-2">PLAN ACTUAL</div>}
            <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
            <div className="text-3xl font-extrabold text-teal-700 mb-1">
              {formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-400">/mes</span>
            </div>
            <p className="text-[10px] text-gray-400 mb-4">+ ITBIS</p>
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

      {/* Bank transfer */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-2">Datos para transferencia bancaria</h3>
        <p className="text-sm text-gray-500 mb-4">Haz una transferencia con los datos de abajo y envía el comprobante por WhatsApp</p>
        <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
          <div className="flex justify-between items-center"><span className="text-gray-400">Banco:</span><span className="font-semibold">{BANK_INFO.banco}</span></div>
          <div className="flex justify-between items-center"><span className="text-gray-400">Titular:</span><span className="font-semibold">{BANK_INFO.titular}</span></div>
          <div className="flex justify-between items-center"><span className="text-gray-400">Pasaporte:</span><span className="font-semibold">{BANK_INFO.pasaporte}</span></div>
          <div className="flex justify-between items-center"><span className="text-gray-400">Tipo de cuenta:</span><span className="font-semibold">{BANK_INFO.tipo}</span></div>
          <div className="flex justify-between items-center"><span className="text-gray-400">N.° de cuenta:</span><span className="font-mono font-bold text-lg text-teal-700">{BANK_INFO.cuenta}</span></div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Una vez verificado tu pago, activaremos tu plan en menos de 24 horas.</p>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">Preguntas frecuentes</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-gray-800">¿Puedo cambiar de plan en cualquier momento?</p>
            <p className="text-gray-500 mt-1">Sí. Puedes subir o bajar de plan cuando quieras. El cambio se refleja en tu próximo cobro.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">¿Qué pasa si no pago a tiempo?</p>
            <p className="text-gray-500 mt-1">Tu cuenta se pausa. Tus datos se mantienen 30 días. Si pagas durante ese tiempo, todo vuelve a la normalidad.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">¿Puedo cancelar sin penalización?</p>
            <p className="text-gray-500 mt-1">Sí. Cancela cuando quieras. No hay permanencia ni penalizaciones. Tu acceso se mantiene hasta fin del mes pagado.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">¿Mis datos están seguros?</p>
            <p className="text-gray-500 mt-1">Sí. Todo está encriptado y respaldado. Puedes eliminar tu cuenta y todos tus datos se borran permanentemente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
