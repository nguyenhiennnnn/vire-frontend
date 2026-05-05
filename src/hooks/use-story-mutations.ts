import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { storiesApi } from "../services/api-services";
import { getApiError } from "../lib/get-api-error";

export const useCreateStoryMutation = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) =>
      storiesApi.create(file, caption),
    onSuccess: () => {
      toast.success("Đã đăng story");
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Đăng story thất bại")),
  });
};

export const useDeleteStoryMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: (storyId: string) => storiesApi.delete(storyId),
    onSuccess: () => {
      toast.success("Đã xoá story");
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Xoá story thất bại")),
  });
};
