import { cn } from "../../lib/utils";
import { usePresenceStore } from "../../stores/presence-store";

interface Props {
  userId: string;
  size?: "sm" | "md";
  className?: string;
}

export const OnlineBadge = ({ userId, size = "sm", className }: Props) => {
  const isOnline = usePresenceStore((s) => s.isOnline(userId));

  if (!isOnline) return null;

  return (
    <span
      className={cn(
        "block rounded-full border-2 border-background",
        "bg-[hsl(var(--online,142_76%_36%))]",
        size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5",
        className,
      )}
    />
  );
};
