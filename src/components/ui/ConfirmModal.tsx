"use client";

import { Trash2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface Props {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function ConfirmModal({ open, message, onConfirm, onCancel, isPending }: Props) {
  return (
    <Modal
      open={open}
      onClose={isPending ? () => {} : onCancel}
      label={message}
      maxWidth="max-w-xs"
      panelClassName="p-6 flex flex-col gap-5"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="h-11 w-11 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "color-mix(in srgb, var(--error) 12%, transparent)" }}
        >
          <Trash2 className="h-5 w-5" style={{ color: "var(--error)" }} />
        </div>
        <p className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
          {message}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-70"
          style={{ backgroundColor: "var(--error)" }}
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isPending ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
    </Modal>
  );
}
