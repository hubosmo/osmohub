// Resolve quando a imagem está carregada e decodificada (pronta para pintar). Nunca rejeita: em erro resolve igual.
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).finally(resolve);
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}
