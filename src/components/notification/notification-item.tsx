import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { UserAvatar } from "../shared/user-avatar";
import { fromNow, getNotifText, getNotifTarget, cn } from "../../lib/utils";
import type { Notification } from "../../types";
import {
  useMarkReadMutation,
  useDeleteNotificationMutation,
} from "../../hooks/use-notification-mutations";
import { useAlertDialogStore } from "../../stores/alert-dialog-store";

interface Props {
  notification: Notification;
}

export const NotificationItem = ({ notification }: Props) => {
  const navigate = useNavigate();
  const { show } = useAlertDialogStore();

  const markRead = useMarkReadMutation(notification.id);
  const deleteMutation = useDeleteNotificationMutation(notification.id);

  const handleClick = () => {
    if (!notification.isRead) {
      markRead.mutate();
    }
    navigate(getNotifTarget(notification));
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    show({
      title: "Xóa thông báo?",
      description: "Thông báo này sẽ bị xóa vĩnh viễn và không thể khôi phục.",
      confirmLabel: deleteMutation.isPending ? "Đang xóa..." : "Xóa thông báo",
      cancelLabel: "Giữ lại",
      variant: "destructive",
      onConfirm: () => {
        deleteMutation.mutate();
      },
    });
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
          onClick={handleDelete}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
