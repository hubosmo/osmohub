import { MousePointerClick } from "lucide-react";

export function EmptyPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-24">
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-elevated)" }}
      >
        <MousePointerClick className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        Selecciona un elemento del árbol
      </p>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Haz clic en un curso, materia, unidad o tópico para editarlo
      </p>
    </div>
  );
}
