"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Underline as UnderlineIcon, Link2, Highlighter, Unlink, Heading3, Heading4 } from "lucide-react";

type Props = {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  minRows?: number;
};

function normalizeToHtml(val?: string | null): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (trimmed.startsWith("<")) return trimmed;
  return trimmed.split(/\n\n+/).map((p) => `<p>${p.trim()}</p>`).join("") || "";
}

export function MiniEditor({ name, defaultValue, placeholder, minRows = 3 }: Props) {
  const initialHtml = normalizeToHtml(defaultValue);
  const [hiddenValue, setHiddenValue] = useState(initialHtml);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: initialHtml || undefined,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHiddenValue(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: { class: "outline-none" },
    },
  });

  function handleLink() {
    if (editor?.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("URL del enlace:");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }

  function btn(active: boolean) {
    return [
      "h-7 w-7 flex items-center justify-center rounded transition-colors",
      active
        ? "text-white"
        : "hover:bg-[var(--bg-base)]",
    ].join(" ");
  }

  return (
    <div
      className="rounded-lg overflow-hidden mini-editor-wrap"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 border-b"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
      >
        <button
          type="button"
          title="Negrita"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={btn(!!editor?.isActive("bold"))}
          style={editor?.isActive("bold") ? { backgroundColor: "var(--accent)" } : { color: "var(--text-muted)" }}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Cursiva"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={btn(!!editor?.isActive("italic"))}
          style={editor?.isActive("italic") ? { backgroundColor: "var(--accent)" } : { color: "var(--text-muted)" }}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Subrayado"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={btn(!!editor?.isActive("underline"))}
          style={editor?.isActive("underline") ? { backgroundColor: "var(--accent)" } : { color: "var(--text-muted)" }}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Resaltado"
          onClick={() => editor?.chain().focus().toggleHighlight().run()}
          className={btn(!!editor?.isActive("highlight"))}
          style={editor?.isActive("highlight") ? { backgroundColor: "var(--accent)" } : { color: "var(--text-muted)" }}
        >
          <Highlighter className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 mx-1" style={{ backgroundColor: "var(--border)" }} />
        <button
          type="button"
          title="Título H3"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btn(!!editor?.isActive("heading", { level: 3 }))}
          style={editor?.isActive("heading", { level: 3 }) ? { backgroundColor: "var(--accent)" } : { color: "var(--text-muted)" }}
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Título H4"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
          className={btn(!!editor?.isActive("heading", { level: 4 }))}
          style={editor?.isActive("heading", { level: 4 }) ? { backgroundColor: "var(--accent)" } : { color: "var(--text-muted)" }}
        >
          <Heading4 className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 mx-1" style={{ backgroundColor: "var(--border)" }} />
        <button
          type="button"
          title={editor?.isActive("link") ? "Quitar enlace" : "Insertar enlace"}
          onClick={handleLink}
          className={btn(!!editor?.isActive("link"))}
          style={editor?.isActive("link") ? { backgroundColor: "var(--accent)" } : { color: "var(--text-muted)" }}
        >
          {editor?.isActive("link") ? (
            <Unlink className="h-3.5 w-3.5" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Editor area */}
      <div
        className="mini-editor-content px-3 py-2 text-sm cursor-text"
        style={{
          color: "var(--text-primary)",
          backgroundColor: "var(--bg-base)",
          minHeight: `${minRows * 1.75}rem`,
          maxHeight: `${minRows * 1.75}rem`,
          overflowY: "auto",
        }}
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Hidden input for form submission — controlled by React state */}
      <input type="hidden" name={name} value={hiddenValue} onChange={() => {}} />
    </div>
  );
}
