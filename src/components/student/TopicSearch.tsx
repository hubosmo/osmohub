"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ChevronRight } from "lucide-react";
import { buscarTopicos, type TopicResult } from "@/lib/actions/search";

export function TopicSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TopicResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await buscarTopicos(query);
        setResults(res);
        setOpen(res.length > 0);
        setActiveIdx(-1);
      });
    }, 280);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  function buildPath(r: TopicResult) {
    return `/cursos/${r.cursoSlug}/${r.disciplinaSlug}/${r.areaSlug}/${r.slug}`;
  }

  function go(r: TopicResult) {
    setOpen(false);
    setQuery("");
    router.push(buildPath(r));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); go(results[activeIdx]); }
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
  }

  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        Buscar un tema
      </h2>

      <div className="relative">
        {/* Input */}
        <div
          className="flex items-center gap-3 rounded-xl border px-4 h-12 transition-colors"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: open ? "var(--accent)" : "var(--border)",
            boxShadow: open ? "0 0 0 2px color-mix(in srgb, var(--accent) 18%, transparent)" : "none",
          }}
        >
          {isPending
            ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" style={{ color: "var(--accent)" }} />
            : <Search className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => results.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Busca temas, estructuras, conceptos..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-primary)" }}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
              className="text-xs shrink-0 transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {open && results.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border overflow-hidden z-30"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            {results.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onMouseDown={() => go(r)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  backgroundColor: i === activeIdx ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                  borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {r.titulo}
                  </p>
                  <p className="text-xs mt-0.5 flex items-center gap-1 truncate" style={{ color: "var(--text-muted)" }}>
                    {r.cursoNome}
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    {r.disciplinaNome}
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    {r.areaNome}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
