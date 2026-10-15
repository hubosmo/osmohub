"use client";

import { useState, useTransition } from "react";
import { Trash2, Check } from "lucide-react";
import { atualizarOpcao, deletarOpcao, marcarOpcaoCorreta } from "@/lib/actions/content-quizzes";
import { QuizImagePicker } from "@/components/admin/QuizImagePicker";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import type { Opcao } from "./quiz-types";

// ── Row de opção (texto / V-F / múltiple) ─────────────────

export function OpcaoRow({
  opcao, questaoId, quizId, tipo,
}: {
  opcao: Opcao;
  questaoId: string;
  quizId: string;
  tipo: string;
}) {
  const deleteAction = deletarOpcao.bind(null, opcao.id, quizId);
  const markCorrectAction = marcarOpcaoCorreta.bind(null, opcao.id, questaoId, quizId);
  const [opcImagem, setOpcImagem] = useState(opcao.imagem_url ?? "");
  const [, startSaveTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [editingTexto, setEditingTexto] = useState(false);
  const [textoValue, setTextoValue] = useState(opcao.texto);

  function saveTexto(val: string) {
    const trimmed = val.trim();
    setTextoValue(trimmed || opcao.texto);
    setEditingTexto(false);
    if (trimmed === opcao.texto) return;
    const fd = new FormData();
    fd.set("texto", trimmed || opcao.texto);
    fd.set("imagem_url", opcImagem);
    startSaveTransition(() => atualizarOpcao(opcao.id, quizId, fd));
  }

  function handleImageChange(url: string) {
    setOpcImagem(url);
    const fd = new FormData();
    fd.set("texto", textoValue);
    fd.set("imagem_url", url);
    startSaveTransition(() => atualizarOpcao(opcao.id, quizId, fd));
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${opcao.correta ? "var(--accent)" : "var(--border)"}`,
        backgroundColor: opcao.correta ? "color-mix(in srgb, var(--accent) 8%, var(--bg-base))" : "var(--bg-base)",
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <form action={markCorrectAction}>
          <button
            type="submit"
            title={opcao.correta ? "Opción correcta" : "Marcar como correcta"}
            className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
            style={{
              borderColor: opcao.correta ? "var(--accent)" : "var(--border)",
              backgroundColor: opcao.correta ? "var(--accent)" : "transparent",
            }}
          >
            {opcao.correta && <Check className="h-3 w-3 text-white" />}
          </button>
        </form>

        {tipo === "ESCOLHA_IMAGEM" && opcImagem && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={opcImagem} alt="" className="h-8 w-12 object-cover rounded shrink-0" />
        )}

        {editingTexto ? (
          <input
            autoFocus
            className="flex-1 h-7 px-2 rounded text-xs outline-none"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--accent)", color: "var(--text-primary)" }}
            value={textoValue}
            onChange={(e) => setTextoValue(e.target.value)}
            onBlur={(e) => saveTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); saveTexto(textoValue); }
              if (e.key === "Escape") { setTextoValue(opcao.texto); setEditingTexto(false); }
            }}
          />
        ) : (
          <span
            className="flex-1 text-xs cursor-text rounded px-1 py-0.5 transition-colors hover:bg-white/5"
            title="Clic para editar"
            style={{ color: textoValue ? "var(--text-primary)" : "var(--text-muted)" }}
            onClick={() => setEditingTexto(true)}
          >
            {textoValue || "(sin texto)"}
          </span>
        )}

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="h-6 w-6 flex items-center justify-center shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          <Trash2 className="h-3 w-3" />
        </button>
        <ConfirmModal
          open={confirmDelete}
          message="¿Eliminar esta opción?"
          isPending={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => startDelete(() => deleteAction())}
        />
      </div>

      {tipo === "ESCOLHA_IMAGEM" && (
        <div className="px-3 pb-2">
          <QuizImagePicker quizId={quizId} value={opcImagem} onChange={handleImageChange} compact />
        </div>
      )}
    </div>
  );
}

// ── Card de opção de imagem (grid ESCOLHA_IMAGEM) ─────────

export function ImagemOpcaoCard({
  opcao, questaoId, quizId,
}: {
  opcao: Opcao;
  questaoId: string;
  quizId: string;
}) {
  const deleteAction = deletarOpcao.bind(null, opcao.id, quizId);
  const markCorrectAction = marcarOpcaoCorreta.bind(null, opcao.id, questaoId, quizId);
  const [opcImagem, setOpcImagem] = useState(opcao.imagem_url ?? "");
  const [, startSaveTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();

  function handleImageChange(url: string) {
    setOpcImagem(url);
    const fd = new FormData();
    fd.set("texto", opcao.texto);
    fd.set("imagem_url", url);
    startSaveTransition(() => atualizarOpcao(opcao.id, quizId, fd));
  }

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        border: `2px solid ${opcao.correta ? "#22C55E" : "var(--border)"}`,
        backgroundColor: opcao.correta ? "color-mix(in srgb, #22C55E 6%, var(--bg-base))" : "var(--bg-base)",
      }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "4 / 3", maxHeight: 140, backgroundColor: "var(--bg-elevated)" }}>
        {opcImagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={opcImagem} alt="" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Sin imagen</span>
          </div>
        )}

        {opcao.correta && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(34,197,94,0.22)" }}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#22C55E", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
            >
              <Check className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="absolute top-1 right-1 h-5 w-5 rounded flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", color: "#fff" }}
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
        <ConfirmModal
          open={confirmDelete}
          message="¿Eliminar esta opción?"
          isPending={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => startDelete(() => deleteAction())}
        />
      </div>

      <div className="px-1.5 py-1 flex flex-col gap-1">
        <form action={markCorrectAction}>
          <button
            type="submit"
            className="w-full py-1 rounded text-[11px] font-semibold transition-colors"
            style={{
              backgroundColor: opcao.correta ? "#22C55E" : "transparent",
              border: `1px solid ${opcao.correta ? "#22C55E" : "var(--border)"}`,
              color: opcao.correta ? "#fff" : "var(--text-muted)",
            }}
          >
            {opcao.correta ? "✓ Correcta" : "Marcar correcta"}
          </button>
        </form>
        <QuizImagePicker quizId={quizId} value={opcImagem} onChange={handleImageChange} compact />
      </div>
    </div>
  );
}
