"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import type { JSONContent } from "@tiptap/react";

type Props = {
  content: JSONContent;
};

const extensions = [
  StarterKit,
  Underline,
  Highlight,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({
    openOnClick: true,
    HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
  }),
];

export function ArtigoRenderer({ content }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions,
    content,
    editable: false,
    immediatelyRender: false,
    onUpdate: () => fixInternalLinks(),
    onCreate: () => fixInternalLinks(),
  });

  function fixInternalLinks() {
    const el = containerRef.current;
    if (!el) return;
    el.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("/")) {
        a.setAttribute("target", "_self");
        a.removeAttribute("rel");
      }
    });
  }

  useEffect(() => {
    fixInternalLinks();
  });

  return (
    <div ref={containerRef} className="artigo-content">
      <EditorContent editor={editor} />
    </div>
  );
}
