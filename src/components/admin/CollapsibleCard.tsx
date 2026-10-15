"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ACCORDION_OPEN, ACCORDION_CLOSE, ACCORDION_STYLE, STANDARD } from "@/lib/motion";

interface Props {
  storageKey: string;
  icon?: React.ReactNode;
  iconColor?: string;
  label: React.ReactNode;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function CollapsibleCard({
  storageKey, icon, iconColor = "var(--accent)", label, action, defaultOpen = false, className = "", children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    try {
      const v = localStorage.getItem(`adm-card:${storageKey}`);
      if (v !== null) setOpen(v === "1");
    } catch {}
  }, [storageKey]);

  function toggle() {
    const next = !open;
    setOpen(next);
    try { localStorage.setItem(`adm-card:${storageKey}`, next ? "1" : "0"); } catch {}
  }

  return (
    <div className={`rounded-xl${className ? ` ${className}` : ""}`} style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      <div
        className="flex items-center gap-2 px-5 cursor-pointer select-none"
        style={{ height: 52 }}
        onClick={toggle}
      >
        {icon && (
          <div
            className="h-7 w-7 rounded-lg shrink-0 flex items-center justify-center"
            style={{ backgroundColor: (iconColor ?? "var(--accent)") + "22" }}
          >
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
        )}
        <span className="flex-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
        {action && (
          <span onClick={e => e.stopPropagation()}>
            {action}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
        />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={ACCORDION_OPEN} exit={ACCORDION_CLOSE}
            transition={STANDARD} style={ACCORDION_STYLE}
          >
            <div className="px-5 pb-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
