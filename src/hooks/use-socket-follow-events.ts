import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth-store";
import { useSocketStore } from "../stores/socket-store";
import type {
  PaginatedResponse,
  UserProfile,
  SocketFollowPayload,
} from "../types";

export const useSocketFollowEvents = () => {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const onUserFollowed = (payload: SocketFollowPayload) => {
      queryClient.setQueryData<UserProfile>(
        ["profile", payload.followingId],
        (old) =>
          old ? { ...old, followersCount: old.followersCount + 1 } : old,
      );
      queryClient.setQueryData<UserProfile>(
        ["profile", payload.followerId],
        (old) =>
          old ? { ...old, followingCount: old.followingCount + 1 } : old,
      );

      // Thêm vào following list của actor
      if (payload.followerId === user?.id && payload.followingUser) {
        queryClient.setQueryData<
          InfiniteData<PaginatedResponse<typeof payload.followingUser>>
        >(["following", payload.followerId], (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          if (!firstPage) return old;
          if (firstPage.data.some((u) => u?.id === payload.followingUser!.id))
            return old;
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: [payload.followingUser!, ...firstPage.data],
              },
              ...old.pages.slice(1),
            ],
          };
        });
      }

      // Thêm vào followers list của target
      if (payload.followingId === user?.id && payload.followerUser) {
        queryClient.setQueryData<
          InfiniteData<PaginatedResponse<typeof payload.followerUser>>
        >(["followers", payload.followingId], (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          if (!firstPage) return old;
          if (firstPage.data.some((u) => u?.id === payload.followerUser!.id))
            return old;
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: [
                  { ...payload.followerUser!, isFollowing: false },
                  ...firstPage.data,
                ],
              },
              ...old.pages.slice(1),
            ],
          };
        });
      }
    };

    const onUserUnfollowed = (payload: SocketFollowPayload) => {
      queryClient.setQueryData<UserProfile>(
        ["profile", payload.followingId],
        (old) =>
          old
            ? { ...old, followersCount: Math.max(0, old.followersCount - 1) }
            : old,
      );
      queryClient.setQueryData<UserProfile>(
        ["profile", payload.followerId],
        (old) =>
          old
            ? { ...old, followingCount: Math.max(0, old.followingCount - 1) }
            : old,
      );

      if (payload.followerId === user?.id) {
        queryClient.setQueryData<
          InfiniteData<PaginatedResponse<{ id: string }>>
        >(["following", payload.followerId], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((u) => u.id !== payload.followingId),
            })),
          };
        });
      }

      if (payload.followingId === user?.id) {
        queryClient.setQueryData<
          InfiniteData<PaginatedResponse<{ id: string }>>
        >(["followers", payload.followingId], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((u) => u.id !== payload.followerId),
            })),
          };
        });
      }
    };

    socket.on("user:followed", onUserFollowed);
    socket.on("user:unfollowed", onUserUnfollowed);

    return () => {
      socket.off("user:followed", onUserFollowed);
      socket.off("user:unfollowed", onUserUnfollowed);
    };
  }, [socket]); // eslint-disable-line
};
