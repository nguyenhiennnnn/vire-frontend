import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import { UserAvatar } from "../shared/user-avatar";
import { cn } from "../../lib/utils";
import { useCreateCommentMutation } from "../../hooks/use-comment-mutations";

interface Props {
  postId: string;
  replyTo: { id: string; username: string } | null;
  onCancelReply: () => void;
  focusRef?: React.RefObject<HTMLTextAreaElement>;
}

export const CommentInput = ({
  postId,
  replyTo,
  onCancelReply,
  focusRef,
}: Props) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = (focusRef ??
    internalRef) as React.RefObject<HTMLTextAreaElement>;

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  useEffect(() => {
    if (!content) {
      const el = textareaRef.current;
      if (el) el.style.height = "auto";
    }
  }, [content]);

  useEffect(() => {
    if (replyTo) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [replyTo]);

  const createCommentMutation = useCreateCommentMutation({
    postId,
    replyTo,
    onSuccess: () => {
      setContent("");
      onCancelReply();
    },
  });

  const handleSubmit = () => {
    const text = content.trim();
    if (!text || createCommentMutation.isPending) return;
    createCommentMutation.mutate(text);
  };

  if (!user) return null;

  return (
    <div className="sticky bottom-0 bg-background border-t px-4 pt-2 pb-3 space-y-2">
      {replyTo && (
        <div className="flex items-center justify-between bg-primary/10 text-primary text-xs rounded-lg px-3 py-1.5">
          <span>
            Đang trả lời{" "}
            <span className="font-semibold">@{replyTo.username}</span>
          </span>
          <button
            onClick={onCancelReply}
            className="p-0.5 hover:bg-primary/20 rounded transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <UserAvatar user={user} size="sm" className="shrink-0 mb-0.5" />
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            autoResize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={
            replyTo
              ? `Trả lời @${replyTo.username}...`
              : "Viết bình luận... (Ctrl+Enter để gửi)"
          }
          className={cn(
            "flex-1 resize-none rounded-2xl border bg-muted",
            "px-3 py-2 text-sm leading-relaxed",
            "focus:outline-none focus:ring-1 focus:ring-primary overflow-y-auto",
          )}
          style={{ minHeight: "36px", maxHeight: "160px" }}
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || createCommentMutation.isPending}
          className={cn(
            "p-2 rounded-full transition-colors shrink-0 mb-0.5",
            content.trim() && !createCommentMutation.isPending
              ? "text-primary hover:bg-primary/10"
              : "text-muted-foreground cursor-not-allowed",
          )}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
