import { ROTULO_STATUS, type StatusTopico } from "@/lib/progresso";

const COR_STATUS: Record<StatusTopico, string> = {
  "incompleta": "var(--text-muted)",
  "em-progresso": "var(--accent)",
  "completa": "var(--success)",
};

// Selo do status de um tópico (Incompleta, En progreso, Completa)
export function StatusBadge({ status, compacto = false }: { status: StatusTopico; compacto?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border uppercase tracking-wider ${compacto ? "text-[10px] px-2 py-0.5" : "text-[11px] px-3 py-1"}`}
      style={{
        color: COR_STATUS[status],
        borderColor: status === "incompleta" ? "var(--border)" : COR_STATUS[status],
        backgroundColor: "var(--bg-elevated)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: COR_STATUS[status] }} />
      {ROTULO_STATUS[status]}
    </span>
  );
}
