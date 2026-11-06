import { FolderOpen } from "lucide-react";

// Capa padrão das pastas (upload de capa pelo aluno é uma fase futura, ADR 0016)
export function CapaPastaPadrao({ className = "", iconSize = 32 }: { className?: string; iconSize?: number }) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, var(--bg-surface)), color-mix(in srgb, var(--accent) 38%, var(--bg-surface)))" }}
      aria-hidden="true"
    >
      <FolderOpen size={iconSize} strokeWidth={1.5} style={{ color: "var(--accent)", opacity: 0.75 }} />
    </div>
  );
}
