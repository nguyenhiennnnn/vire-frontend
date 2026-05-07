import type { Socket } from "socket.io-client";
import type { QueryClient, InfiniteData } from "@tanstack/react-query";
import type { Post, PaginatedResponse } from "../types";
import {
  patchInfinitePages,
  prependToInfinite,
  removeFromInfinite,
} from "./utils";

interface Deps {
  socket: Socket;
  qc: QueryClient;
}

export const feedEvents = new EventTarget();
export const postEvents = new EventTarget();

export const registerFeedListeners = ({ socket, qc }: Deps) => {
  socket.on("feed:new_post", ({ post }: { post: Post }) => {
    feedEvents.dispatchEvent(new CustomEvent("new_post", { detail: post }));
  });

  socket.on("feed:post_deleted", ({ postId }: { postId: string }) => {
    qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(["feed"], (old) =>
      removeFromInfinite(old, postId),
    );
  });

  socket.on("feed:invalidate", () => {
    qc.invalidateQueries({ queryKey: ["feed"] });
  });

  socket.on("post:created", ({ post }: { post: Post }) => {
    qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(["feed"], (old) =>
      prependToInfinite(old, post),
    );
    qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(
      ["user-posts", post.userId],
      (old) => prependToInfinite(old, post),
    );
  });

  socket.on(
    "post:updated",
    ({ post, privacyChanged }: { post: Post; privacyChanged: boolean }) => {
      qc.setQueryData<Post>(["post", post.id], (old) =>
        old ? { ...old, ...post } : old,
      );

      if (privacyChanged) {
        qc.invalidateQueries({ queryKey: ["feed"] });
        qc.invalidateQueries({ queryKey: ["user-posts", post.userId] });
      } else {
        const patchFeed = (
          old: InfiniteData<PaginatedResponse<Post>> | undefined,
        ) =>
          patchInfinitePages(old, (items) =>
            items.map((p) => (p.id === post.id ? { ...p, ...post } : p)),
          );
        qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(
          ["feed"],
          patchFeed,
        );
        qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(
          ["user-posts", post.userId],
          patchFeed,
        );
      }
    },
  );

  socket.on(
    "post:deleted",
    ({ postId, userId }: { postId: string; userId: string }) => {
      const removePost = (
        old: InfiniteData<PaginatedResponse<Post>> | undefined,
      ) => removeFromInfinite(old, postId);

      qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(
        ["feed"],
        removePost,
      );
      qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(
        ["user-posts", userId],
        removePost,
      );
      qc.removeQueries({ queryKey: ["post", postId] });
    },
  );
};
