import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Users, Search, Clock } from "lucide-react";
import { friendshipsApi } from "../services/api-services";
import { useInfiniteScroll } from "../hooks/use-infinite-scroll";
import {
  FriendRequestCard,
  FriendSuggestionCard,
  FriendCard,
  SentRequestCard,
} from "../components/friend/friend-card";
import { UserCardSkeleton } from "../components/shared/skeleton-card";
import { Input } from "../components/ui/input";
import { useAuth } from "../hooks/use-auth";
import type { User } from "../types";
import { useUnfriendMutation } from "../hooks/use-friendship-mutations";

export default function FriendsPage() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [friendSearch, setFriendSearch] = useState("");

  const {
    data: requestData,
    fetchNextPage: fetchMoreRequests,
    hasNextPage: hasMoreRequests,
    isFetchingNextPage: fetchingRequests,
    isLoading: loadingRequests,
  } = useInfiniteQuery({
    queryKey: ["friendship-requests"],
    queryFn: ({ pageParam }) =>
      friendshipsApi.getRequests(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const requestSentinelRef = useInfiniteScroll({
    fetchNextPage: fetchMoreRequests,
    hasNextPage: hasMoreRequests,
    isFetchingNextPage: fetchingRequests,
  });

  const {
    data: sentData,
    fetchNextPage: fetchMoreSent,
    hasNextPage: hasMoreSent,
    isFetchingNextPage: fetchingSent,
    isLoading: loadingSent,
  } = useInfiniteQuery({
    queryKey: ["friendship-sent"],
    queryFn: ({ pageParam }) =>
      friendshipsApi.getSent(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const sentSentinelRef = useInfiniteScroll({
    fetchNextPage: fetchMoreSent,
    hasNextPage: hasMoreSent,
    isFetchingNextPage: fetchingSent,
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["friend-suggestions"],
    queryFn: () => friendshipsApi.getSuggestions(10),
  });

  const {
    data: friendData,
    fetchNextPage: fetchMoreFriends,
    hasNextPage: hasMoreFriends,
    isFetchingNextPage: fetchingFriends,
    isLoading: loadingFriends,
  } = useInfiniteQuery({
    queryKey: ["friends", user?.id],
    queryFn: ({ pageParam }) =>
      friendshipsApi.getFriends(undefined, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const friendSentinelRef = useInfiniteScroll({
    fetchNextPage: fetchMoreFriends,
    hasNextPage: hasMoreFriends,
    isFetchingNextPage: fetchingFriends,
  });

  const unfriendMutation = useUnfriendMutation();

  const requests = requestData?.pages.flatMap((p) => p.data) ?? [];
  const sent = sentData?.pages.flatMap((p) => p.data) ?? [];
  const friends = (friendData?.pages.flatMap((p) => p.data) ?? []) as User[];
  const visibleSuggestions = suggestions.filter(
    (s) => !dismissed.has(s.user.id),
  );

  const filteredFriends = friendSearch
    ? friends.filter((f) =>
        f.username.toLowerCase().includes(friendSearch.toLowerCase()),
      )
    : friends;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <section>
        <h2 className="font-bold text-lg mb-3">
          Lời mời kết bạn{" "}
          {requests.length > 0 && (
            <span className="text-muted-foreground font-normal">
              ({requests.length})
            </span>
          )}
        </h2>
        <div className="bg-card border rounded-xl overflow-hidden divide-y">
          {loadingRequests &&
            Array.from({ length: 3 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}

          {!loadingRequests && requests.length === 0 && (
            <div className="py-10 text-center">
              <Users
                size={36}
                className="mx-auto text-muted-foreground/40 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                Không có lời mời kết bạn nào
              </p>
            </div>
          )}

          {requests.map((f) => (
            <FriendRequestCard key={f.id} friendship={f} />
          ))}
          {fetchingRequests && <UserCardSkeleton />}
          <div ref={requestSentinelRef} />
        </div>
      </section>

      <section>
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Clock size={18} className="text-muted-foreground" />
          Lời mời đã gửi
          {sent.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({sent.length})
            </span>
          )}
        </h2>
        <div className="bg-card border rounded-xl overflow-hidden divide-y">
          {loadingSent &&
            Array.from({ length: 2 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}

          {!loadingSent && sent.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Chưa gửi lời mời kết bạn nào
              </p>
            </div>
          )}

          {sent.map((f) => (
            <SentRequestCard key={f.id} friendship={f} />
          ))}
          {fetchingSent && <UserCardSkeleton />}
          <div ref={sentSentinelRef} />
        </div>
      </section>

      {visibleSuggestions.length > 0 && (
        <section>
          <h2 className="font-bold text-lg mb-3">
            Những người bạn có thể quen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleSuggestions.map((s) => (
              <FriendSuggestionCard
                key={s.user.id}
                suggestion={s}
                onDismiss={(id) =>
                  setDismissed((prev) => new Set(prev).add(id))
                }
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">
            Bạn bè{" "}
            {friends.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({friends.length})
              </span>
            )}
          </h2>
        </div>

        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Tìm kiếm bạn bè..."
            className="pl-9"
            value={friendSearch}
            onChange={(e) => setFriendSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {loadingFriends &&
            Array.from({ length: 4 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}

          {!loadingFriends && filteredFriends.length === 0 && (
            <div className="col-span-2 py-10 text-center text-sm text-muted-foreground">
              {friendSearch ? "Không tìm thấy bạn bè nào" : "Chưa có bạn bè"}
            </div>
          )}

          {filteredFriends.map((f) => (
            <FriendCard
              key={f.id}
              friend={f}
              onUnfriend={(id) => unfriendMutation.mutate(id)}
            />
          ))}
        </div>

        {fetchingFriends && <UserCardSkeleton />}
        <div ref={friendSentinelRef} />
      </section>
    </div>
  );
}
