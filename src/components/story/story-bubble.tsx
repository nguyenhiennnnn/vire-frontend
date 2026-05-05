import type { UserBasic } from "../../types";
import { UserAvatar } from "../shared/user-avatar";
import { truncate } from "../../lib/utils";

interface StoryBubbleProps {
  user: UserBasic;
  hasUnread: boolean;
  onClick: () => void;
}

export const StoryBubble = ({ user, hasUnread, onClick }: StoryBubbleProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 shrink-0"
  >
    <UserAvatar user={user} size="lg" hasStory hasUnreadStory={hasUnread} />
    <span className="text-xs text-muted-foreground w-14 truncate text-center">
      {truncate(user.username, 8)}
    </span>
  </button>
);
