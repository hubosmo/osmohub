"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  BookMarked,
  Library,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useState, useTransition } from "react";
import { OsmoLogo } from "@/components/brand/OsmoLogo";
import { logoutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/dashboard",         label: "Inicio",          icon: LayoutDashboard },
  { href: "/cursos",            label: "Cursos",           icon: BookOpen },
  { href: "/simulaciones",      label: "Simulaciones",    icon: Gamepad2 },
  { href: "/plan-de-estudios",  label: "Plan de Estudios",icon: BookMarked },
  { href: "/biblioteca",        label: "Biblioteca",      icon: Library },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ userName = "Estudiante", userEmail, isAdmin, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  }

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className="relative flex h-full flex-col border-r border-[--border] bg-[--bg-surface] transition-[width] duration-200"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[--border] px-4" style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
        {collapsed ? (
          <Link href="/dashboard">
            {/* Ícone mínimo: círculo com letra O na cor brand */}
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black" style={{ backgroundColor: "var(--accent-subtle)", color: "#00A6FF" }}>
              O
            </span>
          </Link>
        ) : (
          <Link href="/dashboard">
            <OsmoLogo width={88} idPrefix="sidebar-full" />
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? "var(--accent-subtle)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
                if (!active) e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent";
                if (!active) e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-[--border]" />

      {/* Admin link — solo para admins */}
      {isAdmin && (
        <div className="px-2 pt-2">
          <Link
            href="/admin"
            title={collapsed ? "Admin" : undefined}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
            style={{ color: "#F59E0B" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(245,158,11,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ShieldCheck className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Admin</span>}
          </Link>
        </div>
      )}

      {/* Configuración */}
      <div className="p-2">
        <Link
          href="/configuracion"
          title={collapsed ? "Configuración" : undefined}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Configuración</span>}
        </Link>
      </div>

      {/* User card */}
      <div className="border-t border-[--border] p-3">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "#00A6FF" }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {userName}
              </p>
              {userEmail && (
                <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                  {userEmail}
                </p>
              )}
            </div>
          )}
          {!collapsed && (
            <button
              title="Cerrar sesión"
              disabled={pending}
              onClick={() => startTransition(() => logoutAction())}
              className="rounded-lg p-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--error)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-[72px] flex h-6 w-6 items-center justify-center rounded-full border transition-colors z-10"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-muted)",
        }}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
