import type { Variants, Transition } from "framer-motion";

// ── Transições de tempo ────────────────────────────────────────────────────────

export const FAST: Transition     = { duration: 0.15, ease: "easeOut" };
export const STANDARD: Transition = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };
export const SMOOTH: Transition   = { duration: 0.3,  ease: [0.4, 0, 0.2, 1] };

// ── Páginas ────────────────────────────────────────────────────────────────────

export const PAGE_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0 },
};

export const PAGE_TRANSITION: Transition = { duration: 0.18, ease: [0.4, 0, 0.2, 1] };

// ── Modais (backdrop + painel independentes) ──────────────────────────────────

export const MODAL_BACKDROP: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

export const MODAL_PANEL: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.96, y: 12 },
};

export const MODAL_TRANSITION: Transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] };

// ── Bottom sheet (drawer mobile) ──────────────────────────────────────────────

export const BOTTOM_SHEET: Variants = {
  initial: { opacity: 0, y: "100%" },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: "100%" },
};

export const SHEET_TRANSITION: Transition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] };

// ── Drawer overlay (backdrop de drawers) ──────────────────────────────────────

export const OVERLAY: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

// ── Painéis inline (admin sidebar/painel lateral) ─────────────────────────────

export const INLINE_PANEL: Variants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0  },
  exit:    { opacity: 0, x: 16 },
};

// ── Dropdowns ─────────────────────────────────────────────────────────────────

export const DROPDOWN: Variants = {
  initial: { opacity: 0, scaleY: 0.94, y: -6 },
  animate: { opacity: 1, scaleY: 1,    y: 0  },
  exit:    { opacity: 0, scaleY: 0.94, y: -6 },
};

export const DROPDOWN_ORIGIN = { transformOrigin: "top center" } as const;

// ── Listas com stagger ────────────────────────────────────────────────────────

export const LIST_CONTAINER: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.055 } },
};

export const LIST_ITEM: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

// ── Acordeões (height: 0 → "auto") ───────────────────────────────────────────
// Usar com AnimatePresence + motion.div direto (não variants) por limitação do height:"auto"
// <motion.div initial={{ height: 0, opacity: 0 }} animate={ACCORDION_OPEN} exit={ACCORDION_CLOSE}
//   transition={STANDARD} style={ACCORDION_STYLE}>
export const ACCORDION_OPEN  = { height: "auto" as const, opacity: 1 };
export const ACCORDION_CLOSE = { height: 0, opacity: 0 };
export const ACCORDION_STYLE = { overflow: "hidden" } as const;
