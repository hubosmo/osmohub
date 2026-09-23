"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  html: string;
};

function extractTitle(html: string): { title: string; hasHeading: boolean } {
  const headingMatch = html.match(/<h[34][^>]*>(.*?)<\/h[34]>/i);
  if (headingMatch) {
    return { title: headingMatch[1].replace(/<[^>]+>/g, "").trim(), hasHeading: true };
  }
  const paraMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (paraMatch) {
    const text = paraMatch[1].replace(/<[^>]+>/g, "").trim();
    return { title: text.length > 60 ? text.slice(0, 60).trimEnd() + "…" : text, hasHeading: false };
  }
  return { title: "Leyenda", hasHeading: false };
}

export function CollapsibleCaption({ html }: Props) {
  const [open, setOpen] = useState(false);
  const { title, hasHeading } = extractTitle(html);
  // Remove the first heading from the body so it doesn't duplicate the bar title
  const bodyHtml = hasHeading ? html.replace(/<h[34][^>]*>.*?<\/h[34]>/i, "") : html;

  return (
    <div style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}>
      {/* Toggle bar */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 transition-colors"
        style={{ color: open ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        <span className="text-xs font-medium text-left leading-snug">
          {title}
        </span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 shrink-0 ml-3" style={{ color: "var(--text-muted)" }} />
          : <ChevronDown className="h-3.5 w-3.5 shrink-0 ml-3" style={{ color: "var(--text-muted)" }} />
        }
      </button>

      {/* Content */}
      {open && (
        <div
          className="rich-content px-5 pb-4 text-xs leading-relaxed border-t"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      )}
    </div>
  );
}
