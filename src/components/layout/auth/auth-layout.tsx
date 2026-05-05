import type { ReactNode } from "react";
import { ModeToggle } from "../../mode-toggle";
import { Logo } from "../../shared/logo";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/40 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, hsl(var(--primary)/0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(var(--secondary)/0.06) 0%, transparent 50%)",
        }}
      />

      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      <div className="relative mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Logo />
      </div>

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
        {children}
      </div>
    </div>
  );
}
