import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { commentsApi } from "../services/api-services";
import { getApiError } from "../lib/get-api-error";

export const useCreateCommentMutation = ({
  postId,
  replyTo,
  onSuccess,
}: {
  postId: string;
  replyTo: { id: string; username: string } | null;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: (text: string) =>
      replyTo
        ? commentsApi.createReply(replyTo.id, text)
        : commentsApi.create(postId, text),
    onSuccess: () => onSuccess?.(),
    onError: (err) => toast.error(getApiError(err, "Gửi bình luận thất bại")),
  });
};

export const useUpdateCommentMutation = ({
  commentId,
  onSuccess,
}: {
  postId?: string;
  commentId: string;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: (content: string) => commentsApi.update(commentId, content),
    onSuccess: () => onSuccess?.(),
    onError: (err) => toast.error(getApiError(err, "Sửa bình luận thất bại")),
  });
};

export const useDeleteCommentMutation = ({
  onSuccess,
}: {
  postId?: string;
  parentCommentId?: string;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.delete(commentId),
    onSuccess: () => onSuccess?.(),
    onError: (err) => toast.error(getApiError(err, "Xoá bình luận thất bại")),
  });
};
