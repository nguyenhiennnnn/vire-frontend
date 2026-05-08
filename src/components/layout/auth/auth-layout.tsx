import type { ReactNode } from "react";
import { ModeToggle } from "../../mode-toggle";
import { Logo } from "../../shared/logo";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/40 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/6 blur-[100px]" />
      </div>

      {/* Ghost V shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <img
          src="/assets/decor-v.svg"
          alt=""
          aria-hidden
          className="absolute -top-16 -left-10 w-72 h-72 opacity-[0.06] dark:opacity-[0.1]"
        />
        <img
          src="/assets/decor-v.svg"
          alt=""
          aria-hidden
          className="absolute -bottom-20 -right-10 w-80 h-80 opacity-[0.06] dark:opacity-[0.1] rotate-180"
        />
        <img
          src="/assets/decor-v.svg"
          alt=""
          aria-hidden
          className="absolute top-24 -right-6 w-36 h-36 opacity-[0.04] dark:opacity-[0.07] -rotate-12"
        />
        <img
          src="/assets/decor-v.svg"
          alt=""
          aria-hidden
          className="absolute bottom-20 left-6 w-28 h-28 opacity-[0.04] dark:opacity-[0.07] rotate-12"
        />
        <img
          src="/assets/decor-v.svg"
          alt=""
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 -left-16 w-48 h-48 opacity-[0.03] dark:opacity-[0.06] rotate-6"
        />

        {/* Dot grid */}
        <img
          src="/assets/decor-dots.svg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-[0.025] dark:opacity-[0.04]"
        />
      </div>

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
