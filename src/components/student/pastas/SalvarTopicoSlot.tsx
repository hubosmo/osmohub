import { idsDasPastasComTopico, listarPastasDoUsuario } from "@/lib/db/pastas";
import { SalvarTopicoButton } from "./SalvarTopicoButton";

// Server component: carrega as pastas do aluno e entrega o botão de guardar o tópico. Sem sessão, não mostra nada.
export async function SalvarTopicoSlot({ usuarioId, topicoId }: { usuarioId: string | null; topicoId: string }) {
  if (!usuarioId) return null;
  const [pastas, ids] = await Promise.all([
    listarPastasDoUsuario(usuarioId),
    idsDasPastasComTopico(usuarioId, topicoId),
  ]).catch(() => [null, null] as const);
  if (!pastas || !ids) return null;
  return (
    <SalvarTopicoButton
      topicoId={topicoId}
      pastas={pastas.map((p) => ({ id: p.id, pai_id: p.pai_id, nome: p.nome }))}
      idsIniciais={ids}
    />
  );
}
