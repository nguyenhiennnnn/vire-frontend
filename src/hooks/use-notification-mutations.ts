import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi } from "../services/api-services";
import { getApiError } from "../lib/get-api-error";

export const useMarkReadMutation = (notificationId: string) => {
  return useMutation({
    mutationFn: () => notificationsApi.markRead(notificationId),
  });
};

export const useMarkAllReadMutation = () => {
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onError: (err: any) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};

export const useDeleteNotificationMutation = (notificationId: string) => {
  return useMutation({
    mutationFn: () => notificationsApi.delete(notificationId),
  });
};
