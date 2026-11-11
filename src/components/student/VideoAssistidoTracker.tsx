"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { marcarVideoAssistido } from "@/lib/actions/progresso";
import { FRACAO_VIDEO_ASSISTIDO } from "@/lib/progresso";
import type { ProvedorVideo } from "@/lib/video/provedor";

// Intervalo máximo entre duas leituras de tempo para contar como reprodução contínua; saltos maiores (o aluno
// adiantou o vídeo) e voltas atrás não somam. Assim, pular direto para o final não conta como assistido.
const SALTO_MAXIMO_S = 2.5;

type Mensagem = Record<string, unknown>;

function lerMensagem(data: unknown): Mensagem | null {
  if (typeof data === "string") {
    try {
      const parsed: unknown = JSON.parse(data);
      return parsed && typeof parsed === "object" ? (parsed as Mensagem) : null;
    } catch {
      return null;
    }
  }
  return data && typeof data === "object" ? (data as Mensagem) : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

// Vai dentro do contêiner do player. Soma o tempo realmente reproduzido (YouTube, Vimeo e Bunny avisam por
// postMessage) e, ao chegar a FRACAO_VIDEO_ASSISTIDO da duração, marca o vídeo como assistido.
export function VideoAssistidoTracker({ topicoId, provedor, jaAssistido }: { topicoId: string; provedor: ProvedorVideo; jaAssistido: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const router = useRouter();

  useEffect(() => {
    const iframe = ref.current?.parentElement?.querySelector("iframe");
    if (jaAssistido || !iframe) return;

    let origem: string;
    try {
      origem = new URL(iframe.src).origin;
    } catch {
      return;
    }

    let assistido = 0;
    let ultimo: number | null = null;
    let concluido = false;

    function somar(tempo: number, duracao: number | null, tocando: boolean) {
      if (concluido) return;
      if (tocando && ultimo !== null) {
        const delta = tempo - ultimo;
        if (delta > 0 && delta <= SALTO_MAXIMO_S) assistido += delta;
      }
      ultimo = tempo;
      if (duracao && duracao > 0 && assistido >= duracao * FRACAO_VIDEO_ASSISTIDO) {
        concluido = true;
        void marcarVideoAssistido(topicoId).then((ok) => { if (ok) router.refresh(); });
      }
    }

    function enviar(msg: Mensagem) {
      iframe?.contentWindow?.postMessage(JSON.stringify(msg), origem);
    }

    // Vimeo e Bunny falam o protocolo player.js; o YouTube usa o da sua IFrame API
    function assinar() {
      if (provedor === "youtube") {
        enviar({ event: "listening", id: 1, channel: "widget" });
      } else {
        enviar({ context: "player.js", version: "0.0.11", method: "addEventListener", value: "timeupdate", listener: "timeupdate" });
        enviar({ context: "player.js", version: "0.0.11", method: "addEventListener", value: "ready", listener: "ready" });
      }
    }

    function aoReceber(e: MessageEvent) {
      if (e.source !== iframe?.contentWindow) return;
      const msg = lerMensagem(e.data);
      if (!msg) return;

      if (provedor === "youtube") {
        const info = msg.info as Mensagem | undefined;
        if (msg.event !== "infoDelivery" || !info) return;
        const tempo = num(info.currentTime);
        if (tempo === null) return;
        // playerState 1 = reproduzindo
        const estado = num(info.playerState);
        somar(tempo, num(info.duration), estado === null || estado === 1);
        return;
      }

      if (msg.event === "ready") {
        assinar();
        return;
      }
      if (msg.event === "timeupdate") {
        const v = msg.value as Mensagem | undefined;
        const tempo = num(v?.seconds);
        if (tempo !== null) somar(tempo, num(v?.duration), true);
      }
    }

    window.addEventListener("message", aoReceber);
    iframe.addEventListener("load", assinar);
    assinar();
    // O YouTube só começa a enviar depois de "listening"; repete até o player responder
    const retry = setInterval(assinar, 2000);
    const parar = setTimeout(() => clearInterval(retry), 20000);

    return () => {
      window.removeEventListener("message", aoReceber);
      iframe.removeEventListener("load", assinar);
      clearInterval(retry);
      clearTimeout(parar);
    };
  }, [topicoId, provedor, jaAssistido, router]);

  return <span ref={ref} aria-hidden="true" hidden />;
}
