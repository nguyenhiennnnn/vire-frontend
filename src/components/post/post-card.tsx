import { useState } from "react";
import { Link } from "react-router-dom";
import { PostCardHeader } from "./post-card-header";
import { PostCardMedia } from "./post-card-media";
import { PostCardReactionBar } from "./post-card-reaction-bar";
import { EditPostDialog } from "./edit-post-dialog";
import { cn } from "../../lib/utils";
import type { Post } from "../../types";

interface Props {
  post: Post;
  userId?: string;
  variant?: "compact" | "full";
  onCommentClick?: () => void;
}

const MAX_CONTENT_LENGTH = 300;
const MAX_CONTENT_LINES = 4;

function PostContent({
  html,
  truncate,
  onExpand,
}: {
  html: string;
  truncate: boolean;
  onExpand: () => void;
}) {
  return (
    <div>
      <div
        className={cn(
          "ql-content text-sm text-foreground",
          truncate && "line-clamp-4",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {truncate && (
        <button
          onClick={onExpand}
          className="text-sm text-primary hover:underline mt-0.5 font-medium"
        >
          Xem thêm
        </button>
      )}
    </div>
  );
}

function CommentFooter({ postId, count }: { postId: string; count: number }) {
  if (count === 0) return null;
  return (
    <div className="pt-0.5 border-t">
      <Link
        to={`/posts/${postId}`}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Xem tất cả {count} bình luận
      </Link>
    </div>
  );
}

export const PostCard = ({
  post,
  userId,
  variant = "compact",
  onCommentClick,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (hidden) return null;

  const isLong =
    (post.content?.split("\n").length ?? 0) > MAX_CONTENT_LINES ||
    (post.content?.length ?? 0) > MAX_CONTENT_LENGTH;

  const shouldTruncate = variant === "compact" && isLong && !expanded;

  return (
    <>
      <article className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 space-y-3">
          <PostCardHeader
            post={post}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setHidden(true)}
            onHide={() => setHidden(true)}
          />

          {post.content && (
            <PostContent
              html={post.content}
              truncate={shouldTruncate}
              onExpand={() => setExpanded(true)}
            />
          )}

          {post.mediaUrls.length > 0 && <PostCardMedia urls={post.mediaUrls} />}

          <PostCardReactionBar
            post={post}
            userId={userId}
            inDetail={variant === "full"}
            onCommentClick={onCommentClick}
          />

          {variant === "compact" && (
            <CommentFooter postId={post.id} count={post.commentsCount} />
          )}
        </div>
      </article>

      <EditPostDialog
        post={post}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
};
