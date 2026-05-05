import { useState } from "react";
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
  const [unfriendOpen, setUnfriendOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [unBlockOpen, setUnblockOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

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
            <DropdownMenuItem onClick={() => setCancelOpen(true)}>
              <UserMinus size={13} className="mr-2" /> Huỷ lời mời
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Huỷ lời mời?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn sẽ không gửi lời mời kết bạn đến {profile.username}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <UserMinus size={13} className="mr-2" /> Huỷ
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => cancelRequestMutation.mutate()}
              >
                <UserCheck size={13} className="mr-2" /> Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
          onClick={() => setRejectOpen(true)}
          disabled={rejectRequestMutation.isPending}
        >
          <UserMinus size={14} className="mr-1.5" /> Từ chối
        </Button>

        <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Từ chối lời mời?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn sẽ không trở thành bạn bè với {profile.username}.
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
              onClick={() => setUnfriendOpen(true)}
            >
              <UserMinus size={13} className="mr-2" /> Huỷ kết bạn
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setBlockOpen(true)}
            >
              <Ban size={13} className="mr-2" /> Chặn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
                onClick={() => unfriendMutation.mutate(profile.id)}
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Chặn người dùng?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn sẽ không còn nhận tin từ họ nữa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => blockMutation.mutate()}
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
          onClick={() => setUnblockOpen(true)}
        >
          <Ban size={14} className="mr-1.5" /> Đã chặn
        </Button>

        <AlertDialog open={unBlockOpen} onOpenChange={setUnblockOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Huỷ chặn người dùng?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn sẽ bắt đầu nhận tin từ họ nữa.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => unblockMutation.mutate()}
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return null;
};
