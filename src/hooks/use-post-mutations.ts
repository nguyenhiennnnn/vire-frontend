import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { postsApi } from "../services/api-services";
import { getApiError } from "../lib/get-api-error";
import type { Post, Privacy } from "../types";

export const useCreatePostMutation = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  return useMutation({
    mutationFn: (data: {
      html: string;
      plainText: string;
      privacy: Privacy;
      mediaUrls: string[];
    }) =>
      postsApi.create({
        content: data.plainText.trim() ? data.html : undefined,
        mediaUrls: data.mediaUrls,
        privacy: data.privacy,
      }),
    onSuccess: () => {
      toast.success("Đã đăng bài viết");
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Đăng bài thất bại")),
  });
};

export const useUpdatePostMutation = ({
  post,
  onSuccess,
}: {
  post: Post;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: (data: { html: string; plainText: string; privacy: Privacy }) =>
      postsApi.update(post.id, {
        content: data.plainText.trim() ? data.html : undefined,
        privacy: data.privacy,
      }),
    onSuccess: () => {
      // post:updated socket event handles cache update
      toast.success("Đã cập nhật bài viết");
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Cập nhật thất bại")),
  });
};

export const useDeletePostMutation = ({
  postId,
  onSuccess,
}: {
  postId: string;
  userId?: string; // kept for callsite compat
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: () => postsApi.delete(postId),
    onSuccess: () => {
      // post:deleted socket event handles cache update
      toast.success("Đã xoá bài viết");
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiError(err, "Xoá bài viết thất bại")),
  });
};
