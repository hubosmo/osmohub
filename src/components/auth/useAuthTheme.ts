"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

// Paleta própria das telas de autenticação (fundo com imagem), diferente dos tokens do app.
export function useAuthTheme() {
  const isDark = useTheme().theme === "dark";
  return {
    isDark,
    dividerColor: isDark ? "#1E3A5F" : "#CBD5E1",
    textMain: isDark ? "#FFFFFF" : "#263B4C",
    textSub: isDark ? "#94A3B8" : "#64748B",
    textFaded: isDark ? "#334155" : "#C8D5E8",
  };
}
