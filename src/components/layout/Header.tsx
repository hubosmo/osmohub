"use client";

import { useState, useTransition } from "react";
import { Bell, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { logoutAction } from "@/lib/actions/auth";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onMenuClick?: () => void;
}

export function Header({ userName = "Estudiante", userEmail, onMenuClick }: HeaderProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser]           = useState(false);
  const [pending, startTransition]        = useTransition();

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className="relative flex h-16 items-center justify-between border-b gap-3 px-4 lg:px-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
    >
      {/* Mobile hamburger */}
      <button
        className="flex lg:hidden items-center justify-center h-9 w-9 rounded-lg transition-colors"
        style={{ color: "var(--text-secondary)" }}
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif((v) => !v); setShowUser(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
            style={{ color: "var(--text-secondary)", backgroundColor: showNotif ? "var(--bg-elevated)" : "transparent" }}
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            {/* Badge */}
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: "#00A6FF" }}
            />
          </button>

          {showNotif && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotif(false)} />
              <div
                className="absolute right-0 top-11 z-20 w-72 rounded-2xl border p-4 shadow-xl"
                style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notificaciones</p>
                  <button onClick={() => setShowNotif(false)} style={{ color: "var(--text-muted)" }}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                  No hay notificaciones nuevas.
                </p>
              </div>
            </>
          )}
        </div>

        <ThemeToggle />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUser((v) => !v); setShowNotif(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#00A6FF" }}
            aria-label="Menú de usuario"
          >
            {initials}
          </button>

          {showUser && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUser(false)} />
              <div
                className="absolute right-0 top-11 z-20 w-52 rounded-2xl border py-2 shadow-xl"
                style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
              >
                <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{userName}</p>
                  {userEmail && (
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{userEmail}</p>
                  )}
                </div>
                {[
                  { label: "Mi perfil" },
                  { label: "Configuración" },
                ].map(({ label }) => (
                  <button
                    key={label}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                  >
                    {label}
                  </button>
                ))}
                <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
                <button
                  disabled={pending}
                  onClick={() => { setShowUser(false); startTransition(() => logoutAction()); }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors disabled:opacity-50 cursor-pointer"
                  style={{ color: "var(--error)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-subtle)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  {pending ? "Saliendo..." : "Cerrar sesión"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
