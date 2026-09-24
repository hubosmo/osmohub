"use client";

import { useEffect, useState } from "react";
import { OsmoLogo } from "@/components/brand/OsmoLogo";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("osmo-splash-shown")) return;
    } catch {
      return;
    }

    setVisible(true);

    const fadeTimer  = setTimeout(() => setFading(true), 1500);
    const hideTimer  = setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("osmo-splash-shown", "1"); } catch {}
    }, 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "#0F1117",
        opacity: fading ? 0 : 1,
        transition: "opacity 400ms ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <OsmoLogo
        width={200}
        animated
        accentColor="#00A6FF"
        color="#FFFFFF"
        idPrefix="splash"
      />
    </div>
  );
}
