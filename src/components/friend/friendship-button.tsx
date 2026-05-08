import {
  UserPlus,
  UserCheck,
  UserMinus,
  Clock,
  Users,
  Ban,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { FriendshipStatus, User } from "../../types";
import {
  useAcceptRequestMutation,
  useBlockMutation,
  useCancelRequestMutation,
  useRejectRequestMutation,
  useSendRequestMutation,
  useUnblockMutation,
  useUnfriendMutation,
} from "../../hooks/use-friendship-mutations";
import { useAlertDialogStore } from "../../stores/alert-dialog-store";

interface Props {
  profile: User;
  status: FriendshipStatus;
  onStatusChange: () => void;
}

export const FriendshipButton = ({
  profile,
  status,
  onStatusChange,
}: Props) => {
  const { show } = useAlertDialogStore();

  const sendRequestMutation = useSendRequestMutation({
    profile,
    onSuccess: onStatusChange,
  });

  const cancelRequestMutation = useCancelRequestMutation({
    profile,
    onSuccess: onStatusChange,
  });

  const acceptRequestMutation = useAcceptRequestMutation({
    senderId: profile.id,
    onSuccess: onStatusChange,
  });

  const rejectRequestMutation = useRejectRequestMutation({
    senderId: profile.id,
    onSuccess: onStatusChange,
  });

  const unfriendMutation = useUnfriendMutation();

  const blockMutation = useBlockMutation({
    profileId: profile.id,
    onSuccess: onStatusChange,
  });

  const unblockMutation = useUnblockMutation({
    profileId: profile.id,
    onSuccess: onStatusChange,
  });

  const handleCancelRequest = () => {
    show({
      title: "Huỷ lời mời kết bạn?",
      description: `Lời mời gửi đến ${profile.username} sẽ bị huỷ.`,
      confirmLabel: cancelRequestMutation.isPending
        ? "Đang huỷ..."
        : "Huỷ lời mời",
      cancelLabel: "Giữ lại",
      variant: "destructive",
      onConfirm: () => {
        cancelRequestMutation.mutate();
      },
    });
  };

  const handleRejectRequest = () => {
    show({
      title: "Từ chối lời mời?",
      description: `Bạn sẽ không trở thành bạn bè với ${profile.username}.`,
      confirmLabel: "Từ chối",
      cancelLabel: "Giữ lại",
      variant: "destructive",
      onConfirm: () => {
        rejectRequestMutation.mutate();
      },
    });
  };

  const handleUnfriend = () => {
    show({
      title: "Huỷ kết bạn?",
      description: `Bạn và ${profile.username} sẽ không còn là bạn bè.`,
      confirmLabel: "Huỷ kết bạn",
      cancelLabel: "Giữ lại",
      variant: "destructive",
      onConfirm: () => {
        unfriendMutation.mutate(profile.id);
      },
    });
  };

  const handleBlock = () => {
    show({
      title: "Chặn người dùng?",
      description: `Bạn sẽ không còn nhận tin nhắn hay tương tác từ ${profile.username}.`,
      confirmLabel: "Chặn",
      cancelLabel: "Huỷ",
      variant: "destructive",
      onConfirm: () => {
        blockMutation.mutate();
      },
    });
  };

  const handleUnblock = () => {
    show({
      title: "Bỏ chặn người dùng?",
      description: `Bạn sẽ có thể nhận lại tương tác từ ${profile.username}.`,
      confirmLabel: "Bỏ chặn",
      cancelLabel: "Đóng",
      onConfirm: () => {
        unblockMutation.mutate();
      },
    });
  };

  if (status === "none") {
    return (
      <Button
        size="sm"
        onClick={() => sendRequestMutation.mutate()}
        disabled={sendRequestMutation.isPending}
      >
        <UserPlus size={14} className="mr-1.5" /> Thêm bạn
      </Button>
    );
  }

  if (status === "pending_sent") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary">
              <Clock size={14} className="mr-1.5" /> Đã gửi lời mời
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleCancelRequest}>
              <UserMinus size={13} className="mr-2" /> Huỷ lời mời
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  if (status === "pending_received") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => acceptRequestMutation.mutate()}
          disabled={acceptRequestMutation.isPending}
        >
          <UserCheck size={14} className="mr-1.5" /> Xác nhận
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRejectRequest}
          disabled={rejectRequestMutation.isPending}
        >
          <UserMinus size={14} className="mr-1.5" /> Từ chối
        </Button>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary">
              <Users size={14} className="mr-1.5" /> Bạn bè
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleUnfriend}
            >
              <UserMinus size={13} className="mr-2" /> Huỷ kết bạn
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleBlock}
            >
              <Ban size={13} className="mr-2" /> Chặn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  if (status === "blocked") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={handleUnblock}
        >
          <Ban size={14} className="mr-1.5" /> Đã chặn
        </Button>
      </>
    );
  }

  return null;
};
