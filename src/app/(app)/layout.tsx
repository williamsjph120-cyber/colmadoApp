"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pos": "Punto de Venta",
  "/inventory": "Inventario",
  "/credits": "Créditos",
  "/reports": "Reportes",
  "/plan": "Mi Plan",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    import("@/lib/supabase").then(({ getSupabase }) => {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) router.replace("/login");
        else setLoading(false);
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
