import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth-store";
import { useSocketStore } from "../stores/socket-store";
import { useNotificationStore } from "../stores/notification-store";
import type {
  PaginatedResponse,
  Friendship,
  FriendSuggestion,
  UserCard,
  UserProfile,
  SocketFriendRequestSentPayload,
  SocketFriendRequestCancelledPayload,
  SocketFriendRequestRejectedPayload,
  SocketFriendAcceptedPayload,
  SocketFriendBlockedPayload,
  SocketFriendUnblockedPayload,
  SocketFriendUnfriendedPayload,
} from "../types";

/** Lắng nghe tất cả sự kiện liên quan tới Friendship. */
export const useSocketFriendEvents = () => {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const { incrementFriendRequest, decrementFriendRequest } =
    useNotificationStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // ── Helpers ───────────────────────────────────────────────
    const invalidateSuggestions = () => {
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
      queryClient.invalidateQueries({
        queryKey: ["friend-suggestions-sidebar"],
      });
    };

    const removeSuggestion = (targetId: string) => {
      const updater = (
        old: { suggestions: FriendSuggestion[] } | undefined,
      ) => {
        if (!old?.suggestions) return old;
        return {
          ...old,
          suggestions: old.suggestions.filter((s) => s.user.id !== targetId),
        };
      };
      queryClient.setQueryData(["friend-suggestions"], updater);
      queryClient.setQueryData(["friend-suggestions-sidebar"], updater);
    };

    const removeFromFriendshipList = (
      listKey: unknown[],
      predicate: (f: Friendship) => boolean,
    ) => {
      queryClient.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
        listKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter(predicate),
            })),
          };
        },
      );
    };

    // ── Handlers ──────────────────────────────────────────────
    const onFriendRequestSent = (payload: SocketFriendRequestSentPayload) => {
      if (payload.sender.id !== user?.id) {
        incrementFriendRequest();
        // Receiver: prepend vào inbox
        queryClient.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
          ["friendship-requests"],
          (old) => {
            if (!old) return old;
            const firstPage = old.pages[0];
            if (!firstPage) return old;
            if (firstPage.data.some((f) => f.id === payload.friendship.id))
              return old;
            return {
              ...old,
              pages: [
                { ...firstPage, data: [payload.friendship, ...firstPage.data] },
                ...old.pages.slice(1),
              ],
            };
          },
        );
      } else {
        // Actor: prepend vào sent list
        queryClient.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
          ["friendship-sent"],
          (old) => {
            if (!old) return old;
            const firstPage = old.pages[0];
            if (!firstPage) return old;
            if (firstPage.data.some((f) => f.id === payload.friendship.id))
              return old;
            return {
              ...old,
              pages: [
                { ...firstPage, data: [payload.friendship, ...firstPage.data] },
                ...old.pages.slice(1),
              ],
            };
          },
        );
      }

      const targetId =
        payload.sender.id === user?.id
          ? payload.friendship.receiverId
          : payload.sender.id;

      queryClient.setQueryData<UserProfile>(["profile", targetId], (old) =>
        old
          ? {
              ...old,
              friendshipStatus:
                payload.sender.id === user?.id
                  ? "pending_sent"
                  : "pending_received",
            }
          : old,
      );

      removeSuggestion(targetId);
    };

    const onFriendRequestCancelled = (
      payload: SocketFriendRequestCancelledPayload,
    ) => {
      if (payload.sender.id !== user?.id) {
        // Receiver: xoá khỏi inbox và giảm badge
        decrementFriendRequest();
        removeFromFriendshipList(
          ["friendship-requests"],
          (f) => f.senderId !== payload.sender.id,
        );
      } else {
        // Actor: xoá khỏi sent list
        removeFromFriendshipList(
          ["friendship-sent"],
          (f) => f.senderId !== payload.sender.id,
        );
      }

      const otherId =
        payload.sender.id === user?.id ? undefined : payload.sender.id;
      if (otherId) {
        queryClient.setQueryData<UserProfile>(["profile", otherId], (old) =>
          old ? { ...old, friendshipStatus: "none" } : old,
        );
      }

      invalidateSuggestions();
    };

    const onFriendRequestRejected = (
      payload: SocketFriendRequestRejectedPayload,
    ) => {
      if (payload.receiver.id !== user?.id) {
        // Original sender: xoá khỏi sent list
        removeFromFriendshipList(
          ["friendship-sent"],
          (f) => f.receiverId !== payload.receiver.id,
        );
        queryClient.setQueryData<UserProfile>(
          ["profile", payload.receiver.id],
          (old) => (old ? { ...old, friendshipStatus: "none" } : old),
        );
      } else {
        // Actor (rejecter): xoá khỏi inbox
        removeFromFriendshipList(
          ["friendship-requests"],
          (f) => f.receiverId !== payload.receiver.id,
        );
      }

      invalidateSuggestions();
    };

    const onFriendAccepted = (payload: SocketFriendAcceptedPayload) => {
      const { accepter, requester } = payload;

      if (requester.id === user?.id) {
        removeFromFriendshipList(
          ["friendship-sent"],
          (f) => f.receiverId !== accepter.id,
        );
      }

      if (accepter.id === user?.id) {
        removeFromFriendshipList(
          ["friendship-requests"],
          (f) => f.senderId !== requester.id,
        );
        decrementFriendRequest();
      }

      // Update friendsCount + status cho cả hai profile
      queryClient.setQueryData<UserProfile>(["profile", accepter.id], (old) =>
        old
          ? {
              ...old,
              friendsCount: accepter.friendsCount,
              friendshipStatus: "accepted",
            }
          : old,
      );
      queryClient.setQueryData<UserProfile>(["profile", requester.id], (old) =>
        old
          ? {
              ...old,
              friendsCount: requester.friendsCount,
              friendshipStatus: "accepted",
            }
          : old,
      );

      // Thêm bạn mới vào friends list của mình
      const otherUser = user?.id === accepter.id ? requester : accepter;
      const newFriend: UserCard = {
        id: otherUser.id,
        username: otherUser.username,
        avatar: otherUser.avatar,
        friendsCount: otherUser.friendsCount,
      };
      queryClient.setQueryData<InfiniteData<PaginatedResponse<UserCard>>>(
        ["friends", user?.id],
        (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          if (!firstPage) return old;
          if (firstPage.data.some((f) => f.id === newFriend.id)) return old;
          return {
            ...old,
            pages: [
              { ...firstPage, data: [newFriend, ...firstPage.data] },
              ...old.pages.slice(1),
            ],
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["stories-feed"] });
    };

    const onFriendBlocked = (payload: SocketFriendBlockedPayload) => {
      const { blockerId, blockedId, wasFriends } = payload;
      const otherId = blockerId === user?.id ? blockedId : blockerId;

      queryClient.setQueryData<UserProfile>(["profile", otherId], (old) => {
        if (!old) return old;
        return {
          ...old,
          friendsCount: wasFriends
            ? Math.max(0, old.friendsCount - 1)
            : old.friendsCount,
          friendshipStatus: blockerId === user?.id ? "blocked" : "blocked_by",
        };
      });

      if (wasFriends) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<UserCard>>>(
          ["friends", user?.id],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((u) => u.id !== otherId),
              })),
            };
          },
        );
        queryClient.invalidateQueries({ queryKey: ["feed"] });
        queryClient.invalidateQueries({ queryKey: ["stories-feed"] });
      }

      invalidateSuggestions();
    };

    const onFriendUnblocked = (payload: SocketFriendUnblockedPayload) => {
      const { unblockerId, unblockedId } = payload;
      const otherId = unblockerId === user?.id ? unblockedId : unblockerId;

      queryClient.setQueryData<UserProfile>(["profile", otherId], (old) =>
        old ? { ...old, friendshipStatus: "none" } : old,
      );

      invalidateSuggestions();
    };

    const onFriendUnfriended = (payload: SocketFriendUnfriendedPayload) => {
      const otherId =
        payload.userId === user?.id ? payload.targetId : payload.userId;

      queryClient.setQueryData<UserProfile>(["profile", user?.id], (old) =>
        old
          ? {
              ...old,
              friendsCount: Math.max(0, old.friendsCount - 1),
              friendshipStatus: "none",
            }
          : old,
      );
      queryClient.setQueryData<UserProfile>(["profile", otherId], (old) =>
        old
          ? {
              ...old,
              friendsCount: Math.max(0, old.friendsCount - 1),
              friendshipStatus: "none",
            }
          : old,
      );

      queryClient.setQueryData<InfiniteData<PaginatedResponse<UserCard>>>(
        ["friends", user?.id],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((u) => u.id !== otherId),
            })),
          };
        },
      );

      invalidateSuggestions();
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["stories-feed"] });
    };

    // ── Register ──────────────────────────────────────────────
    socket.on("friend_request_sent", onFriendRequestSent);
    socket.on("friend_request_cancelled", onFriendRequestCancelled);
    socket.on("friend_request_rejected", onFriendRequestRejected);
    socket.on("friend_accepted", onFriendAccepted);
    socket.on("friend_blocked", onFriendBlocked);
    socket.on("friend_unblocked", onFriendUnblocked);
    socket.on("friend_unfriended", onFriendUnfriended);

    return () => {
      socket.off("friend_request_sent", onFriendRequestSent);
      socket.off("friend_request_cancelled", onFriendRequestCancelled);
      socket.off("friend_request_rejected", onFriendRequestRejected);
      socket.off("friend_accepted", onFriendAccepted);
      socket.off("friend_blocked", onFriendBlocked);
      socket.off("friend_unblocked", onFriendUnblocked);
      socket.off("friend_unfriended", onFriendUnfriended);
    };
  }, [socket]); // eslint-disable-line
};
