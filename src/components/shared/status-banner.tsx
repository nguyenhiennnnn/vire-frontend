import type { ReactNode } from "react";

type BannerVariant = "success" | "warning" | "error" | "info";

const STYLES: Record<BannerVariant, string> = {
  success:
    "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300",
  warning:
    "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300",
  error: "bg-destructive/5 border-destructive/20 text-destructive",
  info: "bg-primary/5 border-primary/20 text-primary",
};

const ICONS: Record<BannerVariant, string> = {
  success: "✓",
  warning: "⚠",
  error: "✕",
  info: "i",
};

interface StatusBannerProps {
  variant: BannerVariant;
  children: ReactNode;
}

export function StatusBanner({ variant, children }: StatusBannerProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed ${STYLES[variant]}`}
    >
      <span className="font-bold mt-px shrink-0">{ICONS[variant]}</span>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
