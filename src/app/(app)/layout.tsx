"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "williamsjph120@gmail.com";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pos": "Punto de Venta",
  "/inventory": "Inventario",
  "/credits": "Créditos",
  "/reports": "Reportes",
  "/sales": "Historial de Ventas",
  "/plan": "Mi Plan",
  "/admin": "Admin",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    import("@/lib/supabase").then(({ getSupabase }) => {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.replace("/login");
          return;
        }

        if (session.user.email === ADMIN_EMAIL) {
          setLoading(false);
          return;
        }

        supabase.from("subscriptions").select("*").eq("user_id", session.user.id).single().then(({ data: sub }: any) => {
          if (!sub) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }

          const isActive = sub.status === "activo" || sub.status === "trial";
          const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;
          const isExpired = expiresAt && expiresAt.getTime() < Date.now();

          if (!isActive || isExpired) {
            setAccessDenied(true);
          }
          setLoading(false);
        });
      });
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-50 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl text-center space-y-4">
          <div className="text-5xl">🔒</div>
          <h1 className="text-xl font-black text-gray-900">Plan expirado</h1>
          <p className="text-gray-500 text-sm">Tu periodo de prueba ha terminado o tu plan no está activo. Para seguir usando ColmadoApp, debes activar un plan.</p>
          <button onClick={() => router.replace("/plan")} className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition">Ver planes y precios</button>
          <button onClick={() => { import("@/lib/supabase").then(({ getSupabase }) => { getSupabase().auth.signOut(); window.location.href = "/login"; }); }} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-2xl"
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">{titles[pathname] || "ColmadoApp"}</h1>
          </div>
        </header>
        <div className="p-4 lg:p-7">{children}</div>
      </main>
    </div>
  );
}
