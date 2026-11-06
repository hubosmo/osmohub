"use client";

import { GoogleIcon } from "@/components/brand/GoogleIcon";
import { useAuthTheme } from "./useAuthTheme";

// Divisor "o" + botão do Google, igual no login e no cadastro
export function AuthGoogleOption({ label }: { label: string }) {
  const { isDark, dividerColor, textMain } = useAuthTheme();

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
        <span className="text-xs" style={{ color: isDark ? "#475569" : "#94A3B8" }}>o</span>
        <div className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 rounded-lg py-3 text-sm font-semibold border transition-all hover:brightness-95 active:scale-[0.98]"
        style={{
          backgroundColor: "transparent",
          borderColor: dividerColor,
          color: textMain,
        }}
      >
        <GoogleIcon />
        {label}
      </button>
    </>
  );
}
