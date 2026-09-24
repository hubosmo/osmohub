"use client";

import { useState, type ComponentType } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface AuthInputProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  icon: ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

export function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  icon: Icon,
}: AuthInputProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType  = isPassword && !showPassword ? "password" : isPassword ? "text" : type;
  const inputBg    = isDark ? "#17263A" : "#FFFFFF";
  const textColor  = isDark ? "#F1F5F9" : "#1E293B";
  const borderDefault = isDark ? "#1E3A5F" : "#DDE4EE";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: isDark ? "#94A3B8" : "#64748B" }}
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: isDark ? "#475569" : "#94A3B8" }}
        />
        <input
          id={id}
          type={inputType}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl pl-10 py-3 outline-none transition-colors"
          style={{
            paddingRight: isPassword ? "2.75rem" : "1.25rem",
            backgroundColor: inputBg,
            border: `1.5px solid ${borderDefault}`,
            color: textColor,
            colorScheme: isDark ? "dark" : "light",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#00A6FF";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,166,255,0.12)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderDefault;
            e.currentTarget.style.boxShadow = "";
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 transition-opacity hover:opacity-70"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{ color: isDark ? "#475569" : "#94A3B8" }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
