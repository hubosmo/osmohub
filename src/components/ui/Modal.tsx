"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODAL_BACKDROP, MODAL_PANEL, MODAL_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  // Descrição para leitores de tela
  label: string;
  // Classe Tailwind de largura máxima do painel
  maxWidth?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
  // Para modais que precisam ficar acima de tudo (ex.: guarda de navegação)
  zIndex?: number;
  blurBackdrop?: boolean;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  label,
  maxWidth = "max-w-md",
  panelClassName,
  panelStyle,
  zIndex = 50,
  blurBackdrop = false,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={MODAL_BACKDROP} initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.18 }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex,
            backgroundColor: "rgba(0,0,0,0.6)",
            ...(blurBackdrop ? { backdropFilter: "blur(2px)" } : {}),
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            variants={MODAL_PANEL} initial="initial" animate="animate" exit="exit"
            transition={MODAL_TRANSITION}
            className={cn("w-full rounded-2xl shadow-2xl", maxWidth, panelClassName)}
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", ...panelStyle }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
