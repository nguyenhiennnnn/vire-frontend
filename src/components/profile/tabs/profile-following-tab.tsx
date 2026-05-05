import { useInfiniteQuery } from "@tanstack/react-query";
import { followersApi } from "../../../services/api-services";
import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";
import { UserCardSkeleton } from "../../shared/skeleton-card";
import { FriendCard } from "../../friend/friend-card";
import type { User } from "../../../types";

interface Props {
  userId: string;
}

export const ProfileFollowingTab = ({ userId }: Props) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["following", userId],
      queryFn: ({ pageParam }) =>
        followersApi.getFollowing(userId, pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (l) => l.nextCursor ?? undefined,
      enabled: !!userId,
    });

  const sentinelRef = useInfiniteScroll({ fetchNextPage, hasNextPage, isFetchingNextPage });
  const users = (data?.pages.flatMap((p) => p.data) ?? []) as User[];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <UserCardSkeleton key={`sk-${i}`} />
          ))}
        {users.map((u) => (
          <FriendCard key={u.id} friend={u} />
        ))}
        {!isLoading && users.length === 0 && (
          <p className="col-span-2 text-center py-12 text-sm text-muted-foreground">
            Chưa theo dõi ai
          </p>
        )}
      </div>
      {isFetchingNextPage && <UserCardSkeleton />}
      <div ref={sentinelRef} />
    </div>
  );
};