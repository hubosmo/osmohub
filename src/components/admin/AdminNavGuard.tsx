"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { useUnsavedChanges } from "@/stores/unsaved-changes";
import { Modal } from "@/components/ui/Modal";

export function AdminNavGuard() {
  const { isDirty, setDirty } = useUnsavedChanges();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const pendingHref = useRef<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

      // Only intercept same-origin navigation
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      // Same page — no guard needed
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      e.stopPropagation();
      pendingHref.current = href;
      setShowModal(true);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  function handleDiscard() {
    setDirty(false);
    setShowModal(false);
    if (pendingHref.current) {
      router.push(pendingHref.current);
      pendingHref.current = null;
    }
  }

  function handleStay() {
    setShowModal(false);
    pendingHref.current = null;
  }

  return (
    <Modal
      open={showModal}
      onClose={handleStay}
      label="Cambios sin guardar"
      maxWidth="max-w-sm"
      panelClassName="p-6"
      zIndex={200}
      blurBackdrop
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "color-mix(in srgb, var(--error) 15%, var(--bg-elevated))" }}
        >
          <AlertTriangle className="h-5 w-5" style={{ color: "var(--error)" }} />
        </div>
        <div>
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            Cambios sin guardar
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            ¿Salir sin guardar?
          </p>
        </div>
      </div>

      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Tienes cambios que no han sido guardados. Si sales ahora, perderás las modificaciones realizadas.
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleStay}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        >
          Seguir editando
        </button>
        <button
          onClick={handleDiscard}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: "var(--error)", color: "#fff" }}
        >
          Salir sin guardar
        </button>
      </div>
    </Modal>
  );
}
