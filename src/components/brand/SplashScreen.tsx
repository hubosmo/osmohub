"use client";

import { useEffect, useState } from "react";
import { OsmoLogo } from "@/components/brand/OsmoLogo";
import { useIsClient } from "@/hooks/useIsClient";
import { useSessionStorageValue } from "@/hooks/useStoredValue";

export function SplashScreen() {
  const isClient = useIsClient();
  const [shown, markShown] = useSessionStorageValue("osmo-splash-shown");
  const [fading, setFading] = useState(false);
  const visible = isClient && shown === null;

  useEffect(() => {
    if (!visible) return;

    const fadeTimer = setTimeout(() => setFading(true), 1500);
    const hideTimer = setTimeout(() => markShown("1"), 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible, markShown]);

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
