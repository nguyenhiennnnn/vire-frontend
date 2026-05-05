import { cn } from "../../lib/utils";
import type { UserBasic } from "../../types";
import { AvatarDefault } from "./avatar-default";

interface Props {
  user: UserBasic;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  hasStory?: boolean;
  hasUnreadStory?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZE_CLASS = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
} as const;

export const UserAvatar = ({
  user,
  size = "md",
  hasStory = false,
  hasUnreadStory = false,
  className,
  onClick,
}: Props) => {
  const ring = hasStory
    ? hasUnreadStory
      ? "ring-2 ring-offset-2 ring-blue-500"
      : "ring-2 ring-offset-2 ring-gray-300"
    : "";

  return (
    <div
      className={cn(
        "relative rounded-full shrink-0 overflow-hidden bg-muted",
        SIZE_CLASS[size],
        ring,
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.username}
          className="w-full h-full object-cover"
        />
      ) : (
        <AvatarDefault />
      )}
    </div>
  );
};
