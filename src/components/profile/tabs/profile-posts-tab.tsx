import { useInfiniteQuery } from "@tanstack/react-query";
import { postsApi } from "../../../services/api-services";
import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";
import { PostCard } from "../../post/post-card";
import { PostCardSkeleton } from "../../shared/skeleton-card";

interface Props {
  userId: string;
  myId: string;
}

export const ProfilePostsTab = ({ userId }: Props) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["user-posts", userId],
      queryFn: ({ pageParam }) =>
        postsApi.getUserPosts(userId, pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (l) => l.nextCursor ?? undefined,
      enabled: !!userId,
    });

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  const posts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-3">
      {isLoading && <PostCardSkeleton />}

      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}

      {isFetchingNextPage && <PostCardSkeleton />}

      {!isLoading && posts.length === 0 && (
        <p className="text-center py-12 text-sm text-muted-foreground">
          Chưa có bài viết nào
        </p>
      )}

      <div ref={sentinelRef} />
    </div>
  );
};
