import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { UserAvatar } from "../shared/user-avatar";
import { fromNow, getNotifText, getNotifTarget, cn } from "../../lib/utils";
import type { Notification } from "../../types";
import { useNotificationStore } from "../../stores/notification-store";
import {
  useMarkReadMutation,
  useDeleteNotificationMutation,
} from "../../hooks/use-notification-mutations";
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

interface Props {
  notification: Notification;
}

export const NotificationItem = ({ notification }: Props) => {
  const navigate = useNavigate();
  const { decrementUnread } = useNotificationStore();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const markRead = useMarkReadMutation(notification.id);
  const deleteMutation = useDeleteNotificationMutation(
    notification.id,
    notification.isRead,
  );

  const handleClick = () => {
    if (!notification.isRead) {
      decrementUnread();
      markRead.mutate();
    }
    navigate(getNotifTarget(notification));
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group",
        "hover:bg-muted/60",
        !notification.isRead && "bg-primary/5",
      )}
      onClick={handleClick}
    >
      <UserAvatar
        user={notification.fromUser}
        size="md"
        className="shrink-0 mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-semibold">
            {notification.fromUser.username}
          </span>{" "}
          {getNotifText(
            notification.type,
            notification.fromUser.username,
          ).replace(notification.fromUser.username, "")}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {fromNow(notification.createdAt)}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1.5 shrink-0 mt-1">
        {!notification.isRead && (
          <span className="w-2 h-2 rounded-full bg-primary" />
        )}
        <button
          className={cn(
            "p-1.5 rounded-full hover:bg-muted transition-all text-muted-foreground hover:text-destructive",
            "opacity-0 group-hover:opacity-100",
          )}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteOpen(true);
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá thông báo?</AlertDialogTitle>
            <AlertDialogDescription>
              Thông báo này sẽ bị xoá vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate();
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
