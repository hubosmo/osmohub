import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Osmo — Ciencias que Conectan",
    short_name: "Osmo",
    description: "Plataforma educativa de ciencias con videos, artículos interactivos y simulaciones.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F1117",
    theme_color: "#00A6FF",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
