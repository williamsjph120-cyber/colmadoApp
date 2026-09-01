"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "williamsjph120@gmail.com";

interface UserWithPlan {
  user_id: string;
  email: string;
  plan: string;
  status: string;
  created_at: string;
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
      if (!user || user.email !== ADMIN_EMAIL) {
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

  if (!isAdmin) return null;

  const plans = [
    { id: "gratis", label: "Gratis", color: "bg-gray-100 text-gray-700" },
    { id: "basico", label: "Básico", color: "bg-blue-100 text-blue-700" },
    { id: "premium", label: "Premium", color: "bg-purple-100 text-purple-700" },
  ];

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
          <p className="text-2xl font-extrabold text-blue-600">{users.filter((u) => u.plan !== "gratis").length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 mb-1">Ingresos mensuales</p>
          <p className="text-2xl font-extrabold text-green-600">
            RD${users.reduce((sum, u) => sum + (u.plan === "basico" ? 1000 : u.plan === "premium" ? 1600 : 0), 0).toLocaleString()}
          </p>
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
                <th className="px-5 py-3">Registro</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-semibold">{u.email}</td>
                  <td className="px-5 py-3">
                    {editingUser === u.user_id ? (
                      <div className="flex gap-2">
                        {plans.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => updatePlan(u.user_id, p.id)}
                            className={`px-3 py-1 rounded text-xs font-semibold ${p.color} hover:opacity-80`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.plan === "premium" ? "bg-purple-100 text-purple-700" :
                        u.plan === "basico" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {u.plan === "basico" ? "Básico" : u.plan === "premium" ? "Premium" : "Gratis"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-700">{u.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString("es-DO")}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setEditingUser(editingUser === u.user_id ? null : u.user_id)}
                      className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700"
                    >
                      {editingUser === u.user_id ? "Cancelar" : "Cambiar plan"}
                    </button>
                  </td>
                </tr>
              ))}
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
