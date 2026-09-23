"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { OsmoLogo } from "@/components/brand/OsmoLogo";

interface AuthLeftPanelProps {
  logoIdPrefix?: string;
  animated?: boolean;
}

export function AuthLeftPanel({ logoIdPrefix = "auth-left", animated = false }: AuthLeftPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: isDark ? "#0D1B2A" : "#E8F1FA" }}
    >
      {/* Decorative circles — top right */}
      <svg
        className="absolute -top-16 -right-16 pointer-events-none"
        width="320"
        height="320"
        viewBox="0 0 320 320"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="220" cy="100" r="140" stroke="#00A6FF" strokeWidth="2.5" strokeOpacity="0.35" fill="none" />
        <circle cx="270" cy="60" r="100" stroke="#00A6FF" strokeWidth="2.5" strokeOpacity="0.22" fill="none" />
      </svg>

      {/* Decorative circles — bottom left */}
      <svg
        className="absolute -bottom-20 -left-20 pointer-events-none"
        width="300"
        height="300"
        viewBox="0 0 300 300"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="80" cy="220" r="130" stroke="#00A6FF" strokeWidth="2.5" strokeOpacity="0.3" fill="none" />
        <circle cx="40" cy="260" r="90" stroke="#00A6FF" strokeWidth="2.5" strokeOpacity="0.18" fill="none" />
      </svg>

      {/* Logo + tagline */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
        <OsmoLogo width={220} idPrefix={logoIdPrefix} animated={animated} />
        <p
          className="tracking-[0.3em] text-sm font-semibold uppercase"
          style={{ color: "#263B4C", opacity: isDark ? 0.75 : 1 }}
        >
          Ciencias que Conectan
        </p>
      </div>
    </div>
  );
}
