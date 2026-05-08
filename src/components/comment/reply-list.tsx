import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { commentsApi } from "../../services/api-services";
import { useAuth } from "../../hooks/use-auth";
import { UserAvatar } from "../shared/user-avatar";
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
  commentId: string;
  postId: string;
  onReply: (username: string) => void;
}

export const ReplyList = ({ commentId, postId, onReply }: Props) => {
  const { user } = useAuth();
  const { show } = useAlertDialogStore();

  const {
    data: replies = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["replies", commentId],
    queryFn: () => commentsApi.getReplies(commentId),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const updateCommentMutation = useUpdateCommentMutation({
    postId,
    commentId: editingId ?? "",
    onSuccess: () => setEditingId(null),
  });

  const deleteCommentMutation = useDeleteCommentMutation({
    postId,
    parentCommentId: commentId,
  });

  const handleDelete = (replyId: string) => {
    show({
      title: "Xóa phản hồi?",
      description: "Phản hồi này sẽ bị xóa vĩnh viễn.",
      confirmLabel: deleteCommentMutation.isPending
        ? "Đang xóa..."
        : "Xóa phản hồi",
      cancelLabel: "Giữ lại",
      variant: "destructive",
      onConfirm: () => {
        deleteCommentMutation.mutate(replyId);
      },
    });
  };

  // ─── Loading ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="ml-10 flex items-center gap-2 py-2 text-xs text-muted-foreground">
        <Loader2 size={12} className="animate-spin" />
        Đang tải trả lời...
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────
  if (isError) {
    return (
      <div className="ml-10 py-2 text-xs text-destructive">
        Không thể tải trả lời.
      </div>
    );
  }

  // ─── Empty ────────────────────────────────────────────
  if (replies.length === 0) {
    return (
      <div className="ml-10 py-2 text-xs text-muted-foreground">
        Chưa có trả lời nào.
      </div>
    );
  }

  return (
    <>
      <div className="ml-10 space-y-3 mt-1 border-l-2 border-border/50 pl-3">
        {replies.map((reply: Comment) => {
          const isOwn = user?.id === reply.userId;
          const isEditing = editingId === reply.id;

          return (
            <div key={reply.id} className="flex gap-2 group">
              <UserAvatar
                user={reply.user}
                size="xs"
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1 min-w-0">
                {/* Content */}
                {isEditing ? (
                  <div className="space-y-1.5">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      autoFocus
                      className="w-full border rounded-xl px-3 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-muted"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          updateCommentMutation.mutate(editContent)
                        }
                        disabled={
                          !editContent.trim() || updateCommentMutation.isPending
                        }
                        className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                      >
                        {updateCommentMutation.isPending
                          ? "Đang lưu..."
                          : "Lưu"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        Huỷ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="inline-block bg-muted rounded-2xl px-3 py-1.5 max-w-full">
                    <span className="font-semibold text-xs block leading-tight">
                      {reply.user.username}
                    </span>
                    <p className="text-xs whitespace-pre-wrap wrap-break-word">
                      {reply.content}
                    </p>
                  </div>
                )}

                {/* Action row */}
                <div className="flex items-center gap-2 px-1 mt-0.5 text-xs text-muted-foreground">
                  <span>{fromNow(reply.createdAt)}</span>
                  <button
                    className="font-semibold hover:text-foreground transition-colors"
                    onClick={() => onReply(reply.user.username)}
                  >
                    Trả lời
                  </button>

                  {isOwn && !isEditing && (
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-0.5 rounded hover:bg-muted">
                            <MoreHorizontal size={13} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-28">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingId(reply.id);
                              setEditContent(reply.content);
                            }}
                          >
                            <Pencil size={12} className="mr-2" /> Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(reply.id)}
                          >
                            <Trash2 size={12} className="mr-2" /> Xoá
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
