"use client";

import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

export function Header({ userName, userEmail }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-bg-surface px-6">
      {/* Busca */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          placeholder="Buscar temas, materias..."
          className="pl-9 bg-bg-elevated border-border-subtle text-sm"
        />
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <Bell className="h-5 w-5 text-text-secondary" />
        </Button>

        <ThemeToggle />

        {/* Avatar / menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-brand text-sm font-semibold text-white"
              aria-label="Menú de usuario"
            >
              {userName ? userName[0].toUpperCase() : "U"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-text-muted font-normal">
              {userEmail ?? "usuario@osmo.app"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-error">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
