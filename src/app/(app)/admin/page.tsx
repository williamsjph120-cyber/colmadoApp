"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserWithPlan {
  user_id: string;
  email: string;
  plan: string;
  status: string;
  created_at: string;
  expires_at: string | null;
}

let _s: any = null;
async function getS() { if (!_s) { const m = await import("@/lib/supabase"); _s = m.getSupabase(); } return _s; }

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const supabase = await getS();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: adminCheck } = await supabase.rpc("is_admin");
      if (!adminCheck) {
        router.replace("/dashboard");
        return;
      }
      setIsAdmin(true);
      loadUsers();
    };
    check();
  }, [router]);

  const loadUsers = async () => {
    const supabase = await getS();
    const { data, error } = await supabase.rpc("get_all_users");
    if (data) setUsers(data);
    setLoading(false);
  };

  const updatePlan = async (userId: string, newPlan: string) => {
    const supabase = await getS();
    await supabase.rpc("admin_update_plan", { target_user_id: userId, new_plan: newPlan });
    setEditingUser(null);
    loadUsers();
  };

  const renewPlan = async (userId: string) => {
    const supabase = await getS();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await supabase.from("subscriptions").update({ status: "activo", expires_at: expires.toISOString() }).eq("user_id", userId);
    loadUsers();
  };

  const approvePayment = async (userId: string) => {
    const supabase = await getS();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await supabase.from("subscriptions").update({ status: "activo", expires_at: expires.toISOString() }).eq("user_id", userId);
    loadUsers();
  };

  const deactivateUser = async (userId: string) => {
    if (!confirm("¿Desactivar este usuario? No podrá usar la app.")) return;
    const supabase = await getS();
    await supabase.from("subscriptions").update({ status: "inactivo" }).eq("user_id", userId);
    loadUsers();
  };

  if (!isAdmin) return null;

  const plans = [
    { id: "basico", label: "Básico", price: 500, color: "bg-blue-100 text-blue-700" },
    { id: "estandar", label: "Estándar", price: 800, color: "bg-purple-100 text-purple-700" },
    { id: "premium", label: "Premium", price: 1200, color: "bg-amber-100 text-amber-700" },
  ];

  const activePaid = users.filter((u) => u.status === "activo" || u.status === "trial");
  const revenue = users.reduce((sum, u) => {
    if (u.status === "inactivo") return sum;
    return sum + (u.plan === "basico" ? 500 : u.plan === "estandar" ? 800 : u.plan === "premium" ? 1200 : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Panel de Admin</h2>
        <span className="text-sm text-gray-400">{users.length} usuarios</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Total usuarios</p>
          <p className="text-2xl font-extrabold text-teal-600">{users.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Planes activos</p>
          <p className="text-2xl font-extrabold text-blue-600">{activePaid.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Ingresos mensuales</p>
          <p className="text-2xl font-extrabold text-green-600">RD${revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-sm">Usuarios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Expira</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const expiresAt = u.expires_at ? new Date(u.expires_at) : null;
                const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
                return (
                  <tr key={u.user_id} className="border-t border-gray-100">
                    <td className="px-5 py-3 font-semibold">{u.email}</td>
                    <td className="px-5 py-3">
                      {editingUser === u.user_id ? (
                        <div className="flex gap-1 flex-wrap">
                          {plans.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => updatePlan(u.user_id, p.id)}
                              className={`px-2 py-1 rounded text-[10px] font-semibold ${p.color} hover:opacity-80`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          u.plan === "premium" ? "bg-amber-100 text-amber-700" :
                          u.plan === "estandar" ? "bg-purple-100 text-purple-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {u.plan === "estandar" ? "Estándar" : u.plan === "premium" ? "Premium" : "Básico"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.status === "activo" ? "bg-green-100 text-green-700" :
                        u.status === "trial" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>{u.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {expiresAt ? (
                        <span className={daysLeft <= 7 ? "text-red-500 font-bold" : "text-gray-500"}>
                          {expiresAt.toLocaleDateString("es-DO")} ({daysLeft}d)
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button
                          onClick={() => setEditingUser(editingUser === u.user_id ? null : u.user_id)}
                          className="px-2 py-1 bg-teal-600 text-white text-[10px] font-semibold rounded hover:bg-teal-700"
                        >
                          {editingUser === u.user_id ? "Cancelar" : "Plan"}
                        </button>
                        <button
                          onClick={() => renewPlan(u.user_id)}
                          className="px-2 py-1 bg-green-600 text-white text-[10px] font-semibold rounded hover:bg-green-700"
                        >
                          +30 días
                        </button>
                        <button
                          onClick={() => deactivateUser(u.user_id)}
                          className="px-2 py-1 bg-red-500 text-white text-[10px] font-semibold rounded hover:bg-red-600"
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Sin usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
