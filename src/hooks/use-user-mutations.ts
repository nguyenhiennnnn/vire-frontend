import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usersApi } from "../services/api-services";
import { getApiError } from "../lib/get-api-error";
import { useAuth } from "./use-auth";
import { useAuthStore } from "../stores/auth-store";

export const useEditProfileMutation = ({
  profile,
  onSuccess,
}: {
  profile: { id: string; username: string; bio?: string | null };
  onSuccess?: () => void;
}) => {
  const qc = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: { username: string; bio: string }) =>
      usersApi.updateMe({
        username:
          data.username !== profile.username ? data.username : undefined,
        bio: data.bio !== (profile.bio ?? "") ? data.bio : undefined,
      }),
    onSuccess: (updatedUser) => {
      updateUser({ username: updatedUser.username, bio: updatedUser.bio });
      qc.invalidateQueries({ queryKey: ["profile", profile.id] });
      onSuccess?.();
      toast.success("Đã cập nhật thông tin");
    },
    onError: (err) => {
      const msg = getApiError(err, "Cập nhật thất bại");
      toast.error(msg.includes("Username") ? "Username đã được sử dụng" : msg);
    },
  });
};

export const useUpdateAvatarMutation = (id: string) => {
  const qc = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => usersApi.updateAvatar(file),
    onSuccess: ({ avatarUrl }) => {
      updateUser({ avatar: avatarUrl });
      qc.invalidateQueries({ queryKey: ["profile", id] });
      toast.success("Đã cập nhật ảnh đại diện");
    },
    onError: (err) => toast.error(getApiError(err, "Cập nhật thất bại")),
  });
};

export const useUpdateCoverMutation = (id: string) => {
  const qc = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => usersApi.updateCover(file),
    onSuccess: ({ coverUrl }) => {
      updateUser({ coverPhoto: coverUrl });
      qc.invalidateQueries({ queryKey: ["profile", id] });
      toast.success("Đã cập nhật ảnh bìa");
    },
    onError: (err) => toast.error(getApiError(err, "Cập nhật thất bại")),
  });
};

export const useUpdateMeMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { username?: string; bio?: string }) =>
      usersApi.updateMe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Đã lưu thay đổi");
    },
    onError: (err: any) => {
      const msg = getApiError(err, "Cập nhật thất bại");
      toast.error(msg.includes("Username") ? "Username đã tồn tại" : msg);
    },
  });
};

export const useDeactivateMutation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: async () => {
      await logout();
      navigate("/login");
    },
    onError: (err: any) =>
      toast.error(getApiError(err, "Vô hiệu hoá thất bại")),
  });
};

export const useDeleteAccountMutation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: usersApi.deleteAccount,
    onSuccess: async () => {
      await logout();
      navigate("/login");
    },
    onError: (err: any) =>
      toast.error(getApiError(err, "Xoá tài khoản thất bại")),
  });
};
