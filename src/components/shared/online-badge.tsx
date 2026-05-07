import { cn } from "../../lib/utils";
import { useOnlineStore } from "../../stores/online-store";

interface Props {
  userId: string;
  size?: "sm" | "md";
  className?: string;
}

export const OnlineBadge = ({ userId, size = "sm", className }: Props) => {
  const online = useOnlineStore((s) => s.isOnline(userId));
  if (!online) return null;

  return (
    <span
      className={cn(
        "block rounded-full border-2 border-background",
        "bg-emerald-500",
        size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5",
        className,
      )}
    />
  );
};
