import type { DetailedHTMLProps, HTMLAttributes } from "react";

// Elemento <model-viewer> (Google, Apache-2.0) para usar em JSX
type ModelViewerAtributos = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "manual";
  "camera-controls"?: boolean;
  "touch-action"?: string;
  "shadow-intensity"?: string;
  exposure?: string;
  "camera-orbit"?: string;
  "camera-target"?: string;
  "field-of-view"?: string;
  "interaction-prompt"?: string;
  "auto-rotate"?: boolean;
};

declare module "react" {
  // Ampliação do JSX do React para o elemento personalizado
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAtributos;
    }
  }
}
