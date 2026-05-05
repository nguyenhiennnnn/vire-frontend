import type { ReactNode } from "react";

interface FormFieldProps {
  error?: string;
  children: ReactNode;
}

export function FormField({ error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
