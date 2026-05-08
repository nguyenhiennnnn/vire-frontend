"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useAuth } from "../../hooks/use-auth";
import { UserAvatar } from "../shared/user-avatar";
import { ReplyList } from "./reply-list";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { fromNow } from "../../lib/utils";

import type { Comment } from "../../types";

import {
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from "../../hooks/use-comment-mutations";

import { useAlertDialogStore } from "../../stores/alert-dialog-store";

interface Props {
  comment: Comment;
  postId: string;
  onReply: (commentId: string, username: string) => void;
}

export const CommentItem = ({ comment, postId, onReply }: Props) => {
  const { user } = useAuth();

  const { show } = useAlertDialogStore();

  const isOwn = user?.id === comment.userId;

  const [showReplies, setShowReplies] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const replyCount = comment._count?.replies ?? 0;

  const updateCommentMutation = useUpdateCommentMutation({
    postId,
    commentId: comment.id,
    onSuccess: () => setEditing(false),
  });

  const deleteCommentMutation = useDeleteCommentMutation({ postId });

  const handleDelete = () => {
    show({
      title: "Xóa bình luận?",
      description:
        "Bình luận và toàn bộ phản hồi liên quan sẽ bị xóa vĩnh viễn.",
      confirmLabel: deleteCommentMutation.isPending
        ? "Đang xóa..."
        : "Xóa bình luận",
      cancelLabel: "Giữ lại",
      variant: "destructive",
      onConfirm: () => {
        deleteCommentMutation.mutate(comment.id);
      },
    });
  };

  return (
    <div className="flex gap-3 group">
      <UserAvatar user={comment.user} size="sm" className="mt-0.5 shrink-0" />

      <div className="flex-1 min-w-0 space-y-1">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-muted"
            />

            <div className="flex gap-3">
              <button
                onClick={() => updateCommentMutation.mutate(editContent)}
                disabled={
                  !editContent.trim() || updateCommentMutation.isPending
                }
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {updateCommentMutation.isPending ? "Đang lưu..." : "Lưu"}
              </button>

              <button
                onClick={() => {
                  setEditing(false);
                  setEditContent(comment.content);
                }}
                className="text-xs text-muted-foreground hover:underline"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div className="inline-block bg-muted rounded-2xl px-3 py-2 max-w-full">
            <span className="font-semibold text-sm block leading-tight">
              {comment.user.username}
            </span>

            <p className="text-sm whitespace-pre-wrap wrap-break-word">
              {comment.content}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 px-1 text-xs text-muted-foreground">
          <span>{fromNow(comment.createdAt)}</span>

          <button
            className="font-semibold hover:text-foreground transition-colors"
            onClick={() => onReply(comment.id, comment.user.username)}
          >
            Trả lời
          </button>

          {replyCount > 0 && (
            <button
              className="flex items-center gap-0.5 text-primary font-medium hover:underline"
              onClick={() => setShowReplies((v) => !v)}
            >
              {showReplies ? (
                <>
                  <ChevronUp size={12} />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown size={12} />
                  Xem {replyCount} phản hồi
                </>
              )}
            </button>
          )}

          {isOwn && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="p-0.5 rounded hover:bg-muted">
                    <MoreHorizontal size={14} />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => setEditing(true)}>
                    <Pencil size={13} className="mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 size={13} className="mr-2" />
                    Xóa bình luận
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {showReplies && (
          <ReplyList
            commentId={comment.id}
            postId={postId}
            onReply={(username) => onReply(comment.id, username)}
          />
        )}
      </div>
    </div>
  );
};
