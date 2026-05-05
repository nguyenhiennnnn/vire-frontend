import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactionPicker } from "./reaction-picker";
import { ReactionSummaryBar } from "./reaction-summary-bar";
import {
  REACTION_EMOJI,
  REACTION_LABEL,
  REACTION_COLOR,
  cn,
} from "../../lib/utils";
import type { Post } from "../../types";
import { toast } from "sonner";
import { useReactionMutation } from "../../hooks/use-reaction-mutations";

interface Props {
  post: Post;
  userId?: string;
  inDetail?: boolean;
  onCommentClick?: () => void;
}

export const PostCardReactionBar = ({
  post,
  userId,
  inDetail = false,
  onCommentClick,
}: Props) => {
  const navigate = useNavigate();
  const {
    myReaction,
    showPicker,
    isPending,
    handleMouseEnter,
    handleMouseLeave,
    handleLikeClick,
    handlePickerSelect,
    clearLeaveTimer,
  } = useReactionMutation(post, userId);

  const handleCommentClick = () => {
    if (inDetail) onCommentClick?.();
    else navigate(`/posts/${post.id}`);
  };

  const handleShareClick = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã copy link bài viết!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể copy link!");
    }
  };

  return (
    <div className="space-y-1">
      {(post.likesCount > 0 || post.commentsCount > 0) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
          <ReactionSummaryBar postId={post.id} />
          {post.commentsCount > 0 && (
            <button
              onClick={handleCommentClick}
              className="hover:underline ml-auto"
            >
              {post.commentsCount} bình luận
            </button>
          )}
        </div>
      )}

      <div className="h-px bg-border" />

      <div className="flex">
        <div
          className="relative flex-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showPicker && (
            <div
              className="absolute bottom-full left-0 mb-2 z-20"
              onMouseEnter={clearLeaveTimer}
              onMouseLeave={handleMouseLeave}
            >
              <ReactionPicker onSelect={handlePickerSelect} />
            </div>
          )}

          <button
            onClick={handleLikeClick}
            disabled={isPending}
            className={cn(
              "flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg",
              "text-sm font-medium transition-colors hover:bg-muted",
              myReaction ? REACTION_COLOR[myReaction] : "text-muted-foreground",
            )}
          >
            {myReaction ? (
              <span className="text-base leading-none">
                {REACTION_EMOJI[myReaction]}
              </span>
            ) : (
              <ThumbsUp size={15} />
            )}
            <span>{myReaction ? REACTION_LABEL[myReaction] : "Thích"}</span>
          </button>
        </div>

        <button
          onClick={handleCommentClick}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <MessageCircle size={15} />
          <span>Bình luận</span>
        </button>

        <button
          onClick={handleShareClick}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <Share2 size={15} />
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>
  );
};
