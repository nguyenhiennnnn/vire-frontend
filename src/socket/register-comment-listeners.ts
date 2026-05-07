import type { Socket } from "socket.io-client";
import type { QueryClient, InfiniteData } from "@tanstack/react-query";
import type { Post, Comment, PaginatedResponse } from "../types";
import type {
  CommentNewPayload,
  CommentUpdatedPayload,
  CommentDeletedPayload,
} from "./types";
import { patchInfinitePages } from "./utils";

interface Deps {
  socket: Socket;
  qc: QueryClient;
}

const patchPostCommentCount = (
  qc: QueryClient,
  postId: string,
  commentsCount: number,
) => {
  qc.setQueryData<Post>(["post", postId], (old) =>
    old ? { ...old, commentsCount } : old,
  );

  const patchInfinite = (
    old: InfiniteData<PaginatedResponse<Post>> | undefined,
  ) =>
    patchInfinitePages(old, (items) =>
      items.map((p) => (p.id === postId ? { ...p, commentsCount } : p)),
    );

  qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(
    ["feed"],
    patchInfinite,
  );
  qc.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
    { queryKey: ["user-posts"] },
    patchInfinite,
  );
};

export const registerCommentListeners = ({ socket, qc }: Deps) => {
  socket.on(
    "comment:new",
    ({ postId, comment, commentsCount, parentId }: CommentNewPayload) => {
      patchPostCommentCount(qc, postId, commentsCount);

      if (!parentId) {
        qc.setQueryData<InfiniteData<PaginatedResponse<Comment>>>(
          ["comments", postId],
          (old) => {
            if (!old) return old;
            const lastPage = old.pages[old.pages.length - 1];
            return {
              ...old,
              pages: [
                ...old.pages.slice(0, -1),
                { ...lastPage, data: [...lastPage.data, comment] },
              ],
            };
          },
        );
      } else {
        qc.setQueryData<Comment[]>(["replies", parentId], (old) =>
          old ? [...old, comment] : old,
        );
        qc.setQueryData<InfiniteData<PaginatedResponse<Comment>>>(
          ["comments", postId],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.map((c) =>
                c.id === parentId && c._count
                  ? { ...c, _count: { replies: c._count.replies + 1 } }
                  : c,
              ),
            ),
        );
      }
    },
  );

  socket.on(
    "comment:updated",
    ({
      postId,
      commentId,
      parentId,
      content,
      updatedAt,
    }: CommentUpdatedPayload) => {
      if (!parentId) {
        qc.setQueryData<InfiniteData<PaginatedResponse<Comment>>>(
          ["comments", postId],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.map((c) =>
                c.id === commentId ? { ...c, content, updatedAt } : c,
              ),
            ),
        );
      } else {
        qc.setQueryData<Comment[]>(["replies", parentId], (old) =>
          old
            ? old.map((r) =>
                r.id === commentId ? { ...r, content, updatedAt } : r,
              )
            : old,
        );
      }
    },
  );

  socket.on(
    "comment:deleted",
    ({ postId, commentId, parentId, commentsCount }: CommentDeletedPayload) => {
      patchPostCommentCount(qc, postId, commentsCount);

      if (!parentId) {
        qc.setQueryData<InfiniteData<PaginatedResponse<Comment>>>(
          ["comments", postId],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.filter((c) => c.id !== commentId),
            ),
        );
      } else {
        qc.setQueryData<Comment[]>(["replies", parentId], (old) =>
          old ? old.filter((r) => r.id !== commentId) : old,
        );
        qc.setQueryData<InfiniteData<PaginatedResponse<Comment>>>(
          ["comments", postId],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.map((c) =>
                c.id === parentId && c._count
                  ? {
                      ...c,
                      _count: { replies: Math.max(0, c._count.replies - 1) },
                    }
                  : c,
              ),
            ),
        );
      }
    },
  );
};
