"use client";

import Link from "next/link";
import { ArrowLeft, Box, Gamepad2, HelpCircle, LayoutDashboard, LayoutPanelLeft, Megaphone, PanelLeftClose, PanelLeftOpen, Users } from "lucide-react";
import { useLocalStorageValue } from "@/hooks/useStoredValue";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/content", label: "Contenido", icon: LayoutPanelLeft },
  { href: "/admin/simulaciones", label: "Simulaciones", icon: Gamepad2 },
  { href: "/admin/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/admin/modelos-3d", label: "Modelos 3D", icon: Box },
  { href: "/admin/novedades", label: "Novedades", icon: Megaphone },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

// Menu lateral do admin, recolhível: no modo recolhido mostra só os ícones (o nome vira dica ao passar o mouse).
// A escolha fica salva no navegador (ADR 0013).
export function AdminSidebar() {
  const [guardado, guardar] = useLocalStorageValue("osmo-admin-sidebar");
  const recogido = guardado === "recogido";

  const itemClase = `flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${recogido ? "justify-center px-0" : "gap-3 px-3"}`;

  return (
    <aside
      className="flex shrink-0 flex-col border-r border-border bg-bg-surface transition-[width] duration-200"
      style={{ width: recogido ? "4rem" : "15rem" }}
    >
      <div className={`flex h-16 items-center border-b border-border ${recogido ? "justify-center px-0" : "px-6"}`}>
        <Link href="/admin" className="text-xl font-bold text-accent-brand" title="Osmo Admin">
          {recogido ? "O" : <>Osmo <span className="text-xs text-text-muted font-normal ml-1">Admin</span></>}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 pt-4">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={recogido ? label : undefined}
            aria-label={label}
            className={`${itemClase} text-text-secondary hover:bg-bg-elevated hover:text-text-primary`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!recogido && label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border p-2">
        <Link
          href="/dashboard"
          title={recogido ? "Volver a la plataforma" : undefined}
          aria-label="Volver a la plataforma"
          className={`${itemClase} text-muted-foreground hover:bg-accent/40 hover:text-foreground`}
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          {!recogido && "Volver a la plataforma"}
        </Link>
        <button
          type="button"
          onClick={() => guardar(recogido ? "expandido" : "recogido")}
          title={recogido ? "Expandir menú" : undefined}
          aria-label={recogido ? "Expandir menú" : "Recoger menú"}
          aria-expanded={!recogido}
          className={`${itemClase} text-text-muted hover:bg-bg-elevated hover:text-text-primary`}
        >
          {recogido ? <PanelLeftOpen className="h-5 w-5 shrink-0" /> : <PanelLeftClose className="h-5 w-5 shrink-0" />}
          {!recogido && "Recoger menú"}
        </button>
      </div>
    </aside>
  );
}
