import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { commentsApi } from "../../services/api-services";
import { useInfiniteScroll } from "../../hooks/use-infinite-scroll";
import { CommentItem } from "./comment-item";
import { CommentInput } from "./comment-input";

interface Props {
  postId: string;
  commentsCount: number;
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded" />
      </div>
    </div>
  );
}

export const CommentSection = ({ postId, commentsCount }: Props) => {
  const [replyTo, setReplyTo] = useState<{
    id: string;
    username: string;
  } | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["comments", postId],
      queryFn: ({ pageParam }) =>
        commentsApi.getByPost(postId, pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
    });

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  const comments = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <MessageCircle size={16} className="text-muted-foreground" />
        <h3 className="font-semibold text-sm">Bình luận ({commentsCount})</h3>
      </div>

      <div className="px-4 py-3 space-y-4 min-h-15">
        {isLoading &&
          Array.from({ length: 2 }).map((_, i) => (
            <CommentSkeleton key={`sk-${i}`} />
          ))}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            onReply={(id, username) => setReplyTo({ id, username })}
          />
        ))}

        {isFetchingNextPage && <CommentSkeleton />}

        <div ref={sentinelRef} />

        {!isLoading && comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Hãy là người đầu tiên bình luận!
          </p>
        )}
      </div>

      <CommentInput
        postId={postId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
};
