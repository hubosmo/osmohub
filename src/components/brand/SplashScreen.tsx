"use client";

import { useEffect, useState } from "react";
import { OsmoLogo } from "@/components/brand/OsmoLogo";
import { useSessionStorageValue } from "@/hooks/useStoredValue";
import { CHAVE_SPLASH } from "@/lib/splash";

// Abertura do app: imagem de fundo (celular) com a animação do logo no centro; depois some e aparece a tela de login.
// O overlay é renderizado também no servidor. Antes ele só aparecia depois da hidratação, e a tela de login
// ficava visível (piscando) até lá.
export function SplashScreen() {
  const [shown, markShown] = useSessionStorageValue(CHAVE_SPLASH);
  const [fading, setFading] = useState(false);
  // Na renderização do servidor e na hidratação `shown` é sempre null, então o HTML já sai com o overlay
  const visible = shown === null;

  useEffect(() => {
    if (!visible) return;

    const fadeTimer = setTimeout(() => setFading(true), 1500);
    const hideTimer = setTimeout(() => markShown("1"), 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible, markShown]);

  return (
    <>
      {/* Pede a imagem já no início, só onde ela é usada (celular) */}
      <link rel="preload" as="image" href="/inicio-movil.webp" media="(max-width: 1023px)" />
      {visible && (
        <div
          className="osmo-splash fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            backgroundColor: "#0F1117",
            opacity: fading ? 0 : 1,
            transition: "opacity 400ms ease",
            pointerEvents: fading ? "none" : "auto",
          }}
        >
          <div className="osmo-splash-imagem absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <OsmoLogo
              width={200}
              animated
              accentColor="#00A6FF"
              color="#FFFFFF"
              idPrefix="splash"
            />
          </div>
        </div>
      )}
    </>
  );
}
