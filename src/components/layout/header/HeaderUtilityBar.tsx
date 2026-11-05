"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../ThemeToggle";
import { logoutAction } from "@/lib/actions/auth";
import { DROPDOWN, DROPDOWN_ORIGIN, FAST } from "@/lib/motion";

interface HeaderUtilityBarProps {
  userName: string;
  userEmail?: string;
  isAdmin?: boolean;
  initials: string;
}

export function HeaderUtilityBar({ userName, userEmail, isAdmin, initials }: HeaderUtilityBarProps) {
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [pending, startTransition] = useTransition();

  const closeAll = () => { setShowUser(false); setShowNotif(false); };

  return (
    <div className="hidden md:block" style={{ height: 36, backgroundColor: "var(--bg-nav-bar)", borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center justify-end gap-2 h-full px-4 lg:px-8 max-w-5xl mx-auto">
      <ThemeToggle />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotif((v) => !v); setShowUser(false); }}
          className="relative flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span
            className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "var(--accent)" }}
          />
        </button>
        <AnimatePresence>
        {showNotif && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeAll} />
            <motion.div
              variants={DROPDOWN} initial="initial" animate="animate" exit="exit"
              transition={FAST}
              className="absolute right-0 top-9 z-50 w-64 rounded-xl border p-4 shadow-xl"
              style={{ ...DROPDOWN_ORIGIN, backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Notificaciones
              </p>
              <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                Sin notificaciones nuevas
              </p>
            </motion.div>
          </>
        )}
        </AnimatePresence>
      </div>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowUser((v) => !v); setShowNotif(false); }}
          className="flex items-center gap-1.5 h-7 px-2 rounded-lg text-xs font-medium transition-colors"
          style={{
            color: "var(--text-secondary)",
            backgroundColor: showUser ? "var(--bg-surface)" : "transparent",
          }}
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {initials}
          </span>
          <span className="hidden sm:inline max-w-[120px] truncate">
            {userName.split(" ")[0]}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0" />
        </button>

        <AnimatePresence>
        {showUser && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeAll} />
            <motion.div
              variants={DROPDOWN} initial="initial" animate="animate" exit="exit"
              transition={FAST}
              className="absolute right-0 top-9 z-50 w-52 rounded-xl border py-1.5 shadow-xl"
              style={{ ...DROPDOWN_ORIGIN, backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {userName}
                </p>
                {userEmail && (
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {userEmail}
                  </p>
                )}
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeAll}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors hover:bg-bg-subtle"
                  style={{ color: "var(--accent)" }}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Panel Admin
                </Link>
              )}

              <button
                className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-bg-subtle"
                style={{ color: "var(--text-secondary)" }}
              >
                Mi perfil
              </button>

              <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />

              <button
                disabled={pending}
                onClick={() => { closeAll(); startTransition(() => logoutAction()); }}
                className="w-full text-left px-3 py-2 text-xs disabled:opacity-50 transition-colors hover:bg-bg-subtle"
                style={{ color: "var(--error)" }}
              >
                {pending ? "Saliendo..." : "Cerrar sesión"}
              </button>
            </motion.div>
          </>
        )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
