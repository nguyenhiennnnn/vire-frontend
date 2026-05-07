import type { Socket } from "socket.io-client";
import type { QueryClient, InfiniteData } from "@tanstack/react-query";
import type {
  Post,
  PaginatedResponse,
  ReactionType,
  ReactionSummary,
} from "../types";
import type { ReactionUpdatedPayload } from "./types";
import { patchInfinitePages } from "./utils";

interface Deps {
  socket: Socket;
  qc: QueryClient;
  myId: string;
}

export const registerReactionListeners = ({ socket, qc, myId }: Deps) => {
  socket.on("reaction:updated", (payload: ReactionUpdatedPayload) => {
    const {
      postId,
      userId: reactorId,
      reactionType,
      likesCount,
      breakdown,
      total,
    } = payload;

    const patchPost = (p: Post): Post => ({
      ...p,
      likesCount,
      reactions:
        reactorId === myId
          ? reactionType
            ? [{ type: reactionType }]
            : []
          : p.reactions,
    });

    qc.setQueryData<Post>(["post", postId], (old) =>
      old ? patchPost(old) : old,
    );

    const patchFeed = (
      old: InfiniteData<PaginatedResponse<Post>> | undefined,
    ) =>
      patchInfinitePages(old, (items) =>
        items.map((p) => (p.id === postId ? patchPost(p) : p)),
      );

    qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(["feed"], patchFeed);
    qc.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
      { queryKey: ["user-posts"] },
      patchFeed,
    );

    qc.setQueryData<ReactionSummary>(
      ["reaction-summary", postId],
      (old: { myReaction: ReactionType | null } | undefined) => ({
        total,
        byType: breakdown,
        myReaction:
          reactorId === myId ? reactionType : (old?.myReaction ?? null),
      }),
    );
  });
};
