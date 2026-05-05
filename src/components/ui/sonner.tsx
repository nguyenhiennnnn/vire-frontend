import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
          "--toast-shadow": "0 8px 30px oklch(0 0 0 / 12%)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast !rounded-2xl !shadow-xl !shadow-black/10 !ring-1 !ring-border !text-sm !font-medium",
          title: "!font-semibold",
          description: "!text-muted-foreground !text-xs",
          actionButton: "!rounded-full !text-xs !font-semibold",
          cancelButton: "!rounded-full !text-xs",
          success:
            "!text-emerald-600 dark:!text-emerald-400 [&>[data-icon]]:!text-emerald-500",
          error: "!text-destructive [&>[data-icon]]:!text-destructive",
          warning:
            "!text-amber-600 dark:!text-amber-400 [&>[data-icon]]:!text-amber-500",
          info: "!text-primary [&>[data-icon]]:!text-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
