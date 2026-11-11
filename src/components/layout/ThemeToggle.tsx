"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/button";

// conTexto: botão com o nome «Tema» ao lado do ícone (barra utilitária do desktop)
export function ThemeToggle({ conTexto = false }: { conTexto?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  const etiqueta = theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  if (conTexto) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={etiqueta}
        className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors hover:bg-bg-subtle"
        style={{ color: "var(--text-secondary)" }}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        Tema
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={etiqueta}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-text-secondary" />
      ) : (
        <Moon className="h-5 w-5 text-text-secondary" />
      )}
    </Button>
  );
}
