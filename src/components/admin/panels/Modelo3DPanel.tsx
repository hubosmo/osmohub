"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminSaveForm } from "@/components/admin/AdminSaveForm";
import { Modelo3DUpload } from "@/components/admin/Modelo3DUpload";
import { PontosEditor, type PontoEditavel } from "@/components/admin/PontosEditor";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { atualizarModelo3d, excluirModelo3d } from "@/lib/actions/content-modelos3d";
import { CREDITOS_MAX, DESCRICAO_MAX, LICENCAS_SUGERIDAS, LICENCA_MAX, TITULO_MAX, formatarTamanho } from "@/lib/modelos3d";

export type Modelo3DData = {
  id: string;
  titulo: string;
  descricao: string | null;
  licenca: string | null;
  creditos: string | null;
  publicado: boolean;
  tamanho_bytes: number | null;
  // URL pública do GLB já enviado (null até o upload)
  arquivo_url: string | null;
  pontos: number;
  topicos: number;
  listaPontos: PontoEditavel[];
};

const SECAO = { border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" };
const CAMPO = "w-full px-3 rounded-lg text-sm outline-none";
const ESTILO_CAMPO = { backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" };
const ROTULO = "text-xs font-medium block mb-1";

export function Modelo3DPanel({ data }: { data: Modelo3DData }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, iniciarExclusao] = useTransition();
  const salvar = atualizarModelo3d.bind(null, data.id);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl p-4" style={SECAO}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Archivo 3D y puntos</h3>
        {data.arquivo_url ? (
          <div className="mb-3">
            <PontosEditor modeloId={data.id} src={data.arquivo_url} titulo={data.titulo} pontos={data.listaPontos} />
            {data.tamanho_bytes && (
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Tamaño: {formatarTamanho(data.tamanho_bytes)}</p>
            )}
          </div>
        ) : (
          <p className="mb-3 text-sm" style={{ color: "var(--text-muted)" }}>Aún no hay archivo. Sube un .glb para ver la vista previa.</p>
        )}
        <Modelo3DUpload modeloId={data.id} temArquivo={!!data.arquivo_url} />
      </section>

      <section className="rounded-xl p-4" style={SECAO}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Información</h3>
        <AdminSaveForm id={`modelo-${data.id}`} action={salvar} className="flex flex-col gap-3">
          <div>
            <label htmlFor="m3d-titulo" className={ROTULO} style={{ color: "var(--text-muted)" }}>Título *</label>
            <input id="m3d-titulo" name="titulo" required maxLength={TITULO_MAX} defaultValue={data.titulo} className={`${CAMPO} h-9`} style={ESTILO_CAMPO} />
          </div>
          <div>
            <label htmlFor="m3d-descricao" className={ROTULO} style={{ color: "var(--text-muted)" }}>Descripción</label>
            <textarea id="m3d-descricao" name="descricao" maxLength={DESCRICAO_MAX} defaultValue={data.descricao ?? ""} rows={2} className={`${CAMPO} py-2 resize-none`} style={ESTILO_CAMPO} />
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div>
              <label htmlFor="m3d-licenca" className={ROTULO} style={{ color: "var(--text-muted)" }}>Licencia</label>
              <input id="m3d-licenca" name="licenca" list="m3d-licencas" maxLength={LICENCA_MAX} defaultValue={data.licenca ?? ""} className={`${CAMPO} h-9`} style={ESTILO_CAMPO} />
              <datalist id="m3d-licencas">{LICENCAS_SUGERIDAS.map((l) => <option key={l} value={l} />)}</datalist>
            </div>
            <div>
              <label htmlFor="m3d-creditos" className={ROTULO} style={{ color: "var(--text-muted)" }}>Créditos del autor</label>
              <input id="m3d-creditos" name="creditos" maxLength={CREDITOS_MAX} defaultValue={data.creditos ?? ""} placeholder="Ej.: Autor, fuente y enlace" className={`${CAMPO} h-9`} style={ESTILO_CAMPO} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="publicado" defaultChecked={data.publicado} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Publicado</span>
          </label>
        </AdminSaveForm>

        <div className="flex items-center justify-between gap-2 pt-3 mt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {data.pontos} {data.pontos === 1 ? "punto" : "puntos"} · {data.topicos} {data.topicos === 1 ? "tema vinculado" : "temas vinculados"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button" onClick={() => setConfirmando(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ color: "var(--error)", border: "1px solid var(--error)", backgroundColor: "transparent" }}
            >
              Eliminar
            </button>
            <button
              type="submit" form={`modelo-${data.id}`}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Guardar
            </button>
          </div>
        </div>
        <ConfirmModal
          open={confirmando}
          message="¿Eliminar este modelo 3D? Se borrarán el archivo, sus puntos y los vínculos con los temas. Esta acción no se puede deshacer."
          isPending={excluindo}
          onCancel={() => setConfirmando(false)}
          onConfirm={() => iniciarExclusao(async () => { await excluirModelo3d(data.id); router.push("/admin/modelos-3d"); })}
        />
      </section>
    </div>
  );
}
