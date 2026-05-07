import type { Socket } from "socket.io-client";
import type { QueryClient } from "@tanstack/react-query";
import type { UserCard } from "../types";
import type { ProfileCache } from "./types";

interface Deps {
  socket: Socket;
  qc: QueryClient;
  myId: string;
}

export const registerFollowListeners = ({ socket, qc, myId }: Deps) => {
  socket.on(
    "follow:new_follower",
    ({ followersCount }: { follower: UserCard; followersCount: number }) => {
      qc.setQueryData<ProfileCache>(["profile", myId], (old) =>
        old ? { ...old, user: { ...old.user, followersCount } } : old,
      );
    },
  );

  socket.on(
    "follow:lost_follower",
    ({ followersCount }: { followerId: string; followersCount: number }) => {
      qc.setQueryData<ProfileCache>(["profile", myId], (old) =>
        old ? { ...old, user: { ...old.user, followersCount } } : old,
      );
    },
  );

  socket.on(
    "follow:following_updated",
    ({
      followingId,
      followingCount,
    }: {
      followingId: string;
      followingCount: number;
    }) => {
      qc.setQueryData<ProfileCache>(["profile", followingId], (old) => {
        if (!old) return old;
        const prevCount = old.user.followingCount as number;
        return { ...old, isFollowing: followingCount > prevCount };
      });
      qc.setQueryData<ProfileCache>(["profile", myId], (old) =>
        old ? { ...old, user: { ...old.user, followingCount } } : old,
      );
    },
  );
};
