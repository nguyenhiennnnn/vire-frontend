import * as React from "react";
import { cn } from "../../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-full border border-input bg-secondary/40 px-4 py-1 text-sm transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/20 dark:focus-visible:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
