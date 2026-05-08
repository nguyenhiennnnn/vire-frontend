import { Link } from "react-router-dom";
import { Check, X, UserPlus, Clock } from "lucide-react";
import { UserAvatar } from "../shared/user-avatar";
import { OnlineBadge } from "../shared/online-badge";
import { Button } from "../ui/button";
import { fromNow } from "../../lib/utils";
import type { Friendship, User, FriendSuggestion } from "../../types";
import { useState } from "react";
import {
  useAcceptRequestMutation,
  useCancelRequestMutation,
  useRejectRequestMutation,
  useSendRequestMutation,
} from "../../hooks/use-friendship-mutations";
import { useAlertDialogStore } from "../../stores/alert-dialog-store";

export const FriendRequestCard = ({
  friendship,
}: {
  friendship: Friendship;
}) => {
  const sender = friendship.sender!;
  const [handled, setHandled] = useState(false);
  const { show } = useAlertDialogStore();

  const acceptRequestMutation = useAcceptRequestMutation({
    senderId: sender.id,
    onSuccess: () => setHandled(true),
  });

  const rejectRequestMutation = useRejectRequestMutation({
    senderId: sender.id,
    onSuccess: () => setHandled(true),
  });

  const handleReject = () => {
    show({
      title: "Từ chối lời mời kết bạn?",
      description: `Bạn sẽ không trở thành bạn bè với ${sender.username}.`,
      confirmLabel: "Từ chối",
      cancelLabel: "Giữ lại",
      variant: "destructive",
      onConfirm: () => {
        rejectRequestMutation.mutate();
      },
    });
  };

  if (handled) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="relative shrink-0">
        <UserAvatar user={sender} size="lg" />
        <OnlineBadge userId={sender.id} className="absolute bottom-0 right-0" />
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${sender.id}`}
          className="font-semibold text-sm hover:underline"
        >
          {sender.username}
        </Link>
        {sender.friendsCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {sender.friendsCount} bạn chung
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {fromNow(friendship.updatedAt)}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          onClick={() => acceptRequestMutation.mutate()}
          disabled={acceptRequestMutation.isPending}
        >
          <Check size={14} className="mr-1" /> Xác nhận
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={rejectRequestMutation.isPending}
        >
          <X size={14} className="mr-1" /> Xoá
        </Button>
      </div>
    </div>
  );
};

export const FriendSuggestionCard = ({
  suggestion,
  onDismiss,
}: {
  suggestion: FriendSuggestion;
  onDismiss: (userId: string) => void;
}) => {
  const { user, mutualCount } = suggestion;

  const sendRequestMutation = useSendRequestMutation({
    profile: user,
  });

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/30 transition-colors">
      <UserAvatar user={user} size="md" />

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${user.id}`}
          className="font-semibold text-sm hover:underline"
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
          variant={sendRequestMutation.isSuccess ? "secondary" : "default"}
          disabled={
            sendRequestMutation.isSuccess || sendRequestMutation.isPending
          }
          onClick={() => sendRequestMutation.mutate()}
          className="h-8 px-2.5 text-xs"
        >
          {sendRequestMutation.isSuccess ? (
            "Đã gửi"
          ) : (
            <>
              <UserPlus size={13} className="mr-1" />
              Thêm bạn
            </>
          )}
        </Button>
        <button
          onClick={() => onDismiss(user.id)}
          className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};

export const SentRequestCard = ({ friendship }: { friendship: Friendship }) => {
  const receiver = friendship.receiver!;
  const [cancelled, setCancelled] = useState(false);
  const { show } = useAlertDialogStore();

  const cancelRequestMutation = useCancelRequestMutation({
    profile: receiver,
    onSuccess: () => setCancelled(true),
  });

  const handleCancelRequest = () => {
    show({
      title: "Huỷ lời mời kết bạn?",
      description: `Lời mời gửi đến ${receiver.username} sẽ bị huỷ.`,
      confirmLabel: cancelRequestMutation.isPending
        ? "Đang huỷ..."
        : "Huỷ lời mời",
      cancelLabel: "Đóng",
      variant: "destructive",
      onConfirm: () => {
        cancelRequestMutation.mutate();
      },
    });
  };

  if (cancelled) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="relative shrink-0">
        <UserAvatar user={receiver} size="lg" />
        <OnlineBadge
          userId={receiver.id}
          className="absolute bottom-0 right-0"
        />
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${receiver.id}`}
          className="font-semibold text-sm hover:underline"
        >
          {receiver.username}
        </Link>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock size={10} />
          Đang chờ xác nhận · {fromNow(friendship.updatedAt)}
        </p>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={handleCancelRequest}
        disabled={cancelRequestMutation.isPending}
        className="shrink-0"
      >
        {cancelRequestMutation.isPending ? "Đang huỷ..." : "Huỷ lời mời"}
      </Button>
    </div>
  );
};

export const FriendCard = ({
  friend,
  onUnfriend,
}: {
  friend: User;
  onUnfriend?: (id: string) => void;
}) => {
  const [removed, setRemoved] = useState(false);
  const { show } = useAlertDialogStore();

  const handleUnfriend = () => {
    show({
      title: "Huỷ kết bạn?",
      description: `Bạn và ${friend.username} sẽ không còn là bạn bè.`,
      confirmLabel: "Huỷ kết bạn",
      cancelLabel: "Giữ lại",
      variant: "destructive",
      onConfirm: () => {
        setRemoved(true);
        onUnfriend?.(friend.id);
      },
    });
  };

  if (removed) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/30 transition-colors">
      <div className="relative shrink-0">
        <UserAvatar user={friend} size="md" />
        <OnlineBadge userId={friend.id} className="absolute bottom-0 right-0" />
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/profile/${friend.id}`}
          className="font-semibold text-sm hover:underline block truncate"
        >
          {friend.username}
        </Link>
        <p className="text-xs text-muted-foreground">
          {friend.friendsCount} bạn bè
        </p>
      </div>

      {onUnfriend && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground shrink-0"
            onClick={handleUnfriend}
          >
            Huỷ kết bạn
          </Button>
        </>
      )}
    </div>
  );
};
