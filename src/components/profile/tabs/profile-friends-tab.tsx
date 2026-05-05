import { useInfiniteQuery } from "@tanstack/react-query";
import { friendshipsApi } from "../../../services/api-services";
import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";
import { FriendCard } from "../../friend/friend-card";
import { UserCardSkeleton } from "../../shared/skeleton-card";
import type { User } from "../../../types";

interface Props {
  userId: string;
}

export const ProfileFriendsTab = ({ userId }: Props) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["friends", userId],
      queryFn: ({ pageParam }) =>
        friendshipsApi.getFriends(userId, pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (l) => l.nextCursor ?? undefined,
      enabled: !!userId,
    });

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  const friends = (data?.pages.flatMap((p) => p.data) ?? []) as User[];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <UserCardSkeleton key={`sk-${i}`} />
          ))}
        {friends.map((f) => (
          <FriendCard key={f.id} friend={f} />
        ))}
        {!isLoading && friends.length === 0 && (
          <p className="col-span-2 text-center py-12 text-sm text-muted-foreground">
            Chưa có bạn bè
          </p>
        )}
      </div>
      {isFetchingNextPage && <UserCardSkeleton />}
      <div ref={sentinelRef} />
    </div>
  );
};
