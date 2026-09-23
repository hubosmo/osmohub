"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
  Highlighter, Link as LinkIcon, Minus, Heading2, Heading3,
} from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import { salvarArtigo } from "@/lib/actions/content";

type Props = {
  topicoId: string;
  initialContent?: JSONContent | null;
};

const extensions = [
  StarterKit,
  Underline,
  Highlight,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Placeholder.configure({ placeholder: "Escribe el contenido del artículo aquí..." }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
  }),
];

export function ArtigoEditor({ topicoId, initialContent }: Props) {
  const [isPending, startTransition] = useTransition();

  const editor = useEditor({
    extensions,
    content: initialContent ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "artigo-editor-input outline-none min-h-[280px]" },
    },
  });

  function handleSave() {
    const json = editor?.getJSON();
    if (!json) return;
    startTransition(async () => {
      try {
        await salvarArtigo(topicoId, json);
        toast.success("¡Artículo guardado!");
      } catch {
        toast.error("Error al guardar el artículo.");
      }
    });
  }

  function handleLink() {
    const url = window.prompt("URL del enlace:");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b"
        style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)" }}
      >
        <TGroup>
          <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrita">
            <Bold className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Cursiva">
            <Italic className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Subrayado">
            <UnderlineIcon className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Tachado">
            <Strikethrough className="h-3.5 w-3.5" />
          </TBtn>
        </TGroup>

        <TDivider />

        <TGroup>
          <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Título H2">
            <Heading2 className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Subtítulo H3">
            <Heading3 className="h-3.5 w-3.5" />
          </TBtn>
        </TGroup>

        <TDivider />

        <TGroup>
          <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista">
            <List className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerada">
            <ListOrdered className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Cita">
            <Quote className="h-3.5 w-3.5" />
          </TBtn>
        </TGroup>

        <TDivider />

        <TGroup>
          <TBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Izquierda">
            <AlignLeft className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centro">
            <AlignCenter className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Derecha">
            <AlignRight className="h-3.5 w-3.5" />
          </TBtn>
        </TGroup>

        <TDivider />

        <TGroup>
          <TBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Resaltar">
            <Highlighter className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={handleLink} active={editor.isActive("link")} title="Enlace">
            <LinkIcon className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Separador horizontal">
            <Minus className="h-3.5 w-3.5" />
          </TBtn>
        </TGroup>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {isPending ? "Guardando…" : "Guardar artículo"}
        </button>
      </div>

      {/* Área do editor */}
      <div className="p-5 artigo-content" style={{ backgroundColor: "var(--bg-base)", minHeight: 280 }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function TGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center">{children}</div>;
}

function TDivider() {
  return <div className="mx-1 h-4 w-px" style={{ backgroundColor: "var(--border)" }} />;
}

function TBtn({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="h-7 w-7 flex items-center justify-center rounded transition-colors"
      style={{
        backgroundColor: active ? "var(--accent)" : "transparent",
        color: active ? "#fff" : "var(--text-secondary)",
      }}
    >
      {children}
    </button>
  );
}
