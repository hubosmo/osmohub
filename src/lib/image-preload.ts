// Imagens já carregadas e decodificadas. Guardar o objeto Image mantém o recurso vivo na memória do navegador,
// então um <img> criado depois com a mesma URL pinta na hora (sem quadro vazio). Limite para não crescer sem fim.
const LIMITE = 24;
const prontas = new Map<string, HTMLImageElement>();
const emAndamento = new Map<string, Promise<void>>();

function guardar(src: string, img: HTMLImageElement) {
  prontas.delete(src);
  prontas.set(src, img);
  while (prontas.size > LIMITE) {
    const maisAntiga = prontas.keys().next().value;
    if (maisAntiga === undefined) break;
    prontas.delete(maisAntiga);
  }
}

// Já foi carregada e decodificada nesta sessão?
export function imagemPronta(src: string): boolean {
  return prontas.has(src);
}

// Resolve quando a imagem está carregada e decodificada (pronta para pintar). Nunca rejeita: em erro resolve igual.
export function preloadImage(src: string): Promise<void> {
  if (prontas.has(src)) return Promise.resolve();
  const existente = emAndamento.get(src);
  if (existente) return existente;

  const promessa = new Promise<void>((resolve) => {
    const img = new window.Image();
    const concluir = (ok: boolean) => {
      if (ok) guardar(src, img);
      emAndamento.delete(src);
      resolve();
    };
    img.onload = () => {
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).finally(() => concluir(true));
    };
    img.onerror = () => concluir(false);
    img.src = src;
  });
  emAndamento.set(src, promessa);
  return promessa;
}
