"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/helpers";

const links = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/pos", icon: "🛒", label: "Punto de Venta" },
  { href: "/inventory", icon: "📦", label: "Inventario" },
  { href: "/credits", icon: "💰", label: "Créditos" },
  { href: "/reports", icon: "📈", label: "Reportes" },
  { href: "/plan", icon: "💳", label: "Mi Plan" },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-teal-700 text-white flex flex-col fixed top-0 left-0 h-full z-50">
      <div className="p-5 border-b border-white/10">
        <Link href="/dashboard" className="text-xl font-black" onClick={onNavigate}>
          Colmado<span className="text-amber-400">App</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-4 pt-4 pb-2">
          Principal
        </p>
        {links.slice(0, 1).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition",
              pathname === link.href
                ? "bg-amber-500 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}

        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-4 pt-6 pb-2">
          Operaciones
        </p>
        {links.slice(1, 5).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition",
              pathname === link.href
                ? "bg-amber-500 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}

        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-4 pt-6 pb-2">
          Cuenta
        </p>
        {links.slice(5).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition",
              pathname === link.href
                ? "bg-amber-500 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={async () => {
            const { supabase } = await import("@/lib/supabase");
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition w-full"
        >
          <span className="text-base">🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
