"use client";

import { useState, useRef, useEffect, type ComponentType } from "react";
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
  const autofilled = useRef(false);
  const inputRef   = useRef<HTMLInputElement>(null);

  const isPassword    = type === "password";
  const isShowingMask = isPassword && !showPassword;
  // Sempre type="text" para campos de senha — controlamos a máscara manualmente.
  // Isso permite usar asteriscos (*) em negrito em vez dos dots do browser.
  const inputType  = isPassword ? "text" : type;
  const inputBg    = isDark ? "#17263A" : "#FFFFFF";
  const textColor  = isDark ? "#F1F5F9" : "#1E293B";
  const borderDefault = isDark ? "#1E3A5F" : "#DDE4EE";

  useEffect(() => {
    if (autofilled.current && inputRef.current) {
      inputRef.current.style.setProperty("-webkit-text-fill-color", textColor, "important");
    }
  }, [textColor]);

  function buildShadow(focused: boolean, filled: boolean) {
    const cover = filled ? `0 0 0 1000px ${inputBg} inset` : null;
    const glow  = focused ? "0 0 0 3px rgba(0,166,255,0.12)" : null;
    return [cover, glow].filter(Boolean).join(", ") || "";
  }

  // Quando em modo máscara: intercepta teclado para manter o valor real no estado.
  function handleKeyDownMasked(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isShowingMask) return;
    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      autofilled.current = false;
      onChange(value.slice(0, -1));
    } else if (key === "Delete") {
      e.preventDefault();
      autofilled.current = false;
      onChange(value.slice(0, -1));
    } else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      autofilled.current = false;
      onChange(value + key);
    }
    // Tab, Enter, setas, Ctrl+Z etc. passam normalmente
  }

  function handlePasteMasked(e: React.ClipboardEvent<HTMLInputElement>) {
    if (!isShowingMask) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    autofilled.current = false;
    onChange(value + pasted);
  }

  // Valor exibido: asteriscos em máscara, texto real caso contrário
  const displayValue = isShowingMask ? "*".repeat(value.length) : value;

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
          ref={inputRef}
          id={id}
          type={inputType}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            // Em modo máscara o onKeyDown controla tudo; em modo visível age normalmente.
            if (!isShowingMask) {
              autofilled.current = false;
              onChange(e.target.value);
            }
          }}
          onKeyDown={handleKeyDownMasked}
          onPaste={handlePasteMasked}
          className={["w-full rounded-2xl pl-10 py-3 outline-none transition-colors", isPassword ? "auth-password-input" : ""].join(" ")}
          style={{
            paddingRight: isPassword ? "2.75rem" : "1.25rem",
            backgroundColor: inputBg,
            border: `1.5px solid ${borderDefault}`,
            color: textColor,
            colorScheme: isDark ? "dark" : "light",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
            letterSpacing: isShowingMask ? "0.25em" : "normal",
            fontWeight: isShowingMask ? "bold" : "normal",
          }}
          onAnimationStart={(e) => {
            if (e.animationName === "auth-autofill-on") {
              autofilled.current = true;
              const el = e.currentTarget;
              el.style.boxShadow = buildShadow(false, true);
              el.style.setProperty("-webkit-text-fill-color", textColor, "important");
              requestAnimationFrame(() => {
                el.style.setProperty("-webkit-text-fill-color", textColor, "important");
              });
            }
            if (e.animationName === "auth-autofill-off") {
              autofilled.current = false;
              e.currentTarget.style.removeProperty("-webkit-text-fill-color");
              e.currentTarget.style.boxShadow = buildShadow(false, false);
            }
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#00A6FF";
            e.currentTarget.style.boxShadow = buildShadow(true, autofilled.current);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderDefault;
            e.currentTarget.style.boxShadow = buildShadow(false, autofilled.current);
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
