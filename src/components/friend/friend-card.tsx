import { Link } from "react-router-dom";
import { Check, X, UserPlus, Clock } from "lucide-react";
import { UserAvatar } from "../shared/user-avatar";
import { OnlineBadge } from "../shared/online-badge";
import { Button } from "../ui/button";
import { fromNow } from "../../lib/utils";
import type { Friendship, User, FriendSuggestion } from "../../types";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  useAcceptRequestMutation,
  useCancelRequestMutation,
  useRejectRequestMutation,
  useSendRequestMutation,
} from "../../hooks/use-friendship-mutations";

// ─── FriendRequestCard ────────────────────────────────────
export const FriendRequestCard = ({
  friendship,
}: {
  friendship: Friendship;
}) => {
  const sender = friendship.sender!;
  const [handled, setHandled] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const acceptRequestMutation = useAcceptRequestMutation({
    senderId: sender.id,
    onSuccess: () => setHandled(true),
  });

  const rejectRequestMutation = useRejectRequestMutation({
    senderId: sender.id,
    onSuccess: () => setHandled(true),
  });

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
          onClick={() => setRejectOpen(true)}
          disabled={rejectRequestMutation.isPending}
        >
          <X size={14} className="mr-1" /> Xoá
        </Button>
      </div>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối lời mời?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sẽ không trở thành bạn bè với {sender.username}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => rejectRequestMutation.mutate()}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── FriendSuggestionCard ─────────────────────────────────
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

// ─── SentRequestCard — lời mời mình đã gửi, chờ đối phương ─
export const SentRequestCard = ({ friendship }: { friendship: Friendship }) => {
  const receiver = friendship.receiver!;
  const [cancelled, setCancelled] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const cancelRequestMutation = useCancelRequestMutation({
    profile: receiver,
    onSuccess: () => setCancelled(true),
  });

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
        onClick={() => setCancelOpen(true)}
        disabled={cancelRequestMutation.isPending}
        className="shrink-0"
      >
        {cancelRequestMutation.isPending ? "Đang huỷ..." : "Huỷ lời mời"}
      </Button>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Huỷ lời mời?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sẽ không gửi lời mời kết bạn đến {receiver.username}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => cancelRequestMutation.mutate()}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── FriendCard ───────────────────────────────────────────
export const FriendCard = ({
  friend,
  onUnfriend,
}: {
  friend: User;
  onUnfriend?: (id: string) => void;
}) => {
  const [unfriendOpen, setUnfriendOpen] = useState(false);
  const [removed, setRemoved] = useState(false);

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
            onClick={() => setUnfriendOpen(true)}
          >
            Huỷ kết bạn
          </Button>

          <AlertDialog open={unfriendOpen} onOpenChange={setUnfriendOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Huỷ kết bạn?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn sẽ không còn là bạn bè nữa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => {
                    setRemoved(true);
                    onUnfriend(friend.id);
                  }}
                >
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};
