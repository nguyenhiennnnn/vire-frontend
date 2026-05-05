import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { friendshipsApi } from "../services/api-services";
import { getApiError } from "../lib/get-api-error";

export const useUnfriendMutation = () => {
  return useMutation({
    mutationFn: (userId: string) => friendshipsApi.unfriend(userId),
    onError: (err: any) =>
      toast.error(getApiError(err, "Huỷ kết bạn thất bại")),
  });
};

export const useSendRequestMutation = ({
  profile,
  onSuccess,
}: {
  profile: { id: string; username: string };
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: () => friendshipsApi.sendRequest(profile.id),
    onSuccess: () => {
      toast.info(`Đã gửi lời mời đến ${profile.username}`);
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};

export const useCancelRequestMutation = ({
  profile,
  onSuccess,
}: {
  profile: { id: string; username: string };
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: () => friendshipsApi.cancel(profile.id),
    onSuccess: () => {
      toast.info(`Đã huỷ lời mời gửi đến ${profile.username}`);
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};

export const useAcceptRequestMutation = ({
  senderId,
  onSuccess,
}: {
  senderId: string;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: () => friendshipsApi.accept(senderId),
    onSuccess: () => {
      toast.success("Đã chấp nhận lời mời");
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};

export const useRejectRequestMutation = ({
  senderId,
  onSuccess,
}: {
  senderId: string;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: () => friendshipsApi.reject(senderId),
    onSuccess: () => {
      toast.info("Đã từ chối lời mời");
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};

export const useBlockMutation = ({
  profileId,
  onSuccess,
}: {
  profileId: string;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: () => friendshipsApi.block(profileId),
    onSuccess: () => {
      toast.info("Đã chặn người dùng");
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};

export const useUnblockMutation = ({
  profileId,
  onSuccess,
}: {
  profileId: string;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: () => friendshipsApi.unblock(profileId),
    onSuccess: () => {
      toast.info("Đã huỷ chặn người dùng");
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Thao tác thất bại")),
  });
};
