"use client";

import { createContext, useContext, useEffect } from "react";
import { useLocalStorageValue } from "@/hooks/useStoredValue";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useLocalStorageValue("osmo-theme");
  const theme: Theme = stored === "light" ? "light" : "dark";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setStored(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
