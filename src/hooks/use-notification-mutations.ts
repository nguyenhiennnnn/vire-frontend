import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNotificationStore } from "../stores/notification-store";
import { notificationsApi } from "../services/api-services";
import { getApiError } from "../lib/get-api-error";

export const useMarkReadMutation = (notificationId: string) => {
  const { markRead } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationsApi.markRead(notificationId),
    onSuccess: () => {
      markRead(notificationId);
    },
  });
};

export const useMarkAllReadMutation = () => {
  const { markAllRead } = useNotificationStore();

  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      markAllRead();
    },
    onError: (err: any) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};

export const useDeleteNotificationMutation = (
  notificationId: string,
  isRead: boolean,
) => {
  const { decrement } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationsApi.delete(notificationId),
    onSuccess: () => {
      if (!isRead) decrement();
    },
  });
};
