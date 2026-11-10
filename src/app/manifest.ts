import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Osmo — Ciencias que Conectan",
    short_name: "Osmo",
    description: "Plataforma educativa de ciencias con videos, artículos interactivos y simulaciones.",
    start_url: "/login",
    display: "standalone",
    // "any": o aluno gira o celular para ver o vídeo em tela cheia na horizontal ("portrait" travava a rotação no app instalado)
    orientation: "any",
    background_color: "#0F1117",
    theme_color: "#00A6FF",
    icons: [
      {
        src: "/icons/pwa-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
