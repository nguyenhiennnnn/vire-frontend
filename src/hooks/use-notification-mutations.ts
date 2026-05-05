import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNotificationStore } from "../stores/notification-store";
import { notificationsApi } from "../services/api-services";
import { getApiError } from "../lib/get-api-error";

const invalidateKeys = ["notifications", "notifications-preview"];

export const useMarkAllReadMutation = () => {
  const qc = useQueryClient();
  const { markAllRead } = useNotificationStore();

  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      markAllRead();
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: any) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};

export const useMarkReadMutation = (notificationId: string) => {
  const queryClient = useQueryClient();
  const { markRead: storeMarkRead } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationsApi.markRead(notificationId),
    onSuccess: () => {
      storeMarkRead(notificationId);
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
    },
  });
};

export const useDeleteNotificationMutation = (
  notificationId: string,
  isRead: boolean,
) => {
  const queryClient = useQueryClient();
  const { decrementUnread } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationsApi.delete(notificationId),
    onSuccess: () => {
      if (!isRead) decrementUnread();
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
    },
  });
};
