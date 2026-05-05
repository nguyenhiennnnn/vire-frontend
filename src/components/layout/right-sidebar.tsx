import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { friendshipsApi } from "../../services/api-services";
import { UserAvatar } from "../shared/user-avatar";
import { Button } from "../ui/button";
import type { FriendSuggestion } from "../../types";
import { useSendRequestMutation } from "../../hooks/use-friendship-mutations";

const SuggestionItem = ({
  suggestion,
  onDismiss,
}: {
  suggestion: FriendSuggestion;
  onDismiss: (id: string) => void;
}) => {
  const { user, mutualCount } = suggestion;

  const sendRequest = useSendRequestMutation({ profile: user });

  return (
    <div className="flex items-center gap-2.5 group px-1">
      <div className="relative shrink-0">
        <UserAvatar user={user} size="sm" />
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${user.id}`}
          className="text-sm font-medium truncate block hover:underline"
        >
          {user.username}
        </Link>
        {mutualCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {mutualCount} bạn chung
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={sendRequest.isSuccess ? "secondary" : "default"}
          className="h-7 px-2 text-xs"
          disabled={sendRequest.isSuccess || sendRequest.isPending}
          onClick={() => sendRequest.mutate()}
        >
          {sendRequest.isSuccess ? "Đã gửi" : <UserPlus size={13} />}
        </Button>

        <button
          onClick={() => onDismiss(user.id)}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};

export const RightSidebar = () => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data: suggestions = [] } = useQuery({
    queryKey: ["friend-suggestions-sidebar"],
    queryFn: () => friendshipsApi.getSuggestions(5),
  });

  const visible = (suggestions as FriendSuggestion[]).filter(
    (s) => !dismissed.has(s.user.id),
  );

  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Có thể bạn quen
      </h3>

      {visible.map((s) => (
        <SuggestionItem
          key={s.user.id}
          suggestion={s}
          onDismiss={(id) => setDismissed((prev) => new Set(prev).add(id))}
        />
      ))}
    </div>
  );
};
