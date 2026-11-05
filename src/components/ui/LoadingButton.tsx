import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: Variant;
}

const VARIANT: Record<Variant, string> = {
  primary: "bg-[var(--accent)] text-white enabled:hover:brightness-110",
  secondary: "border border-[var(--border)] text-[var(--text-secondary)] enabled:hover:opacity-80",
};

export function LoadingButton({
  loading = false,
  loadingText,
  variant = "primary",
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all",
        "enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
