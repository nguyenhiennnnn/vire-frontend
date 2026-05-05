import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type {
  PaginatedResponse,
  Post,
  Reaction,
  ReactionSummary,
  Comment,
  SocketPostCreatedByMePayload,
  PostUpdatedPayload,
  PostDeletedPayload,
  PostReactionPayload,
  NewCommentPayload,
  NewReplyPayload,
  CommentUpdatedPayload,
  CommentDeletedPayload,
  CommentsCountPayload,
} from "../types";
import { useAuthStore } from "../stores/auth-store";
import { useSocketStore } from "../stores/socket-store";
import {
  patchPostInInfinite,
  removePostFromInfinite,
} from "../lib/socket-post-helpers";

/** Lắng nghe tất cả sự kiện liên quan tới Post, Reaction và Comment. */
export const useSocketPostEvents = () => {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // ── Helpers ──────────────────────────────────────────────
    const patchPostInAllCaches = (postId: string, patch: Partial<Post>) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
        { queryKey: ["feed"] },
        (old) => patchPostInInfinite(old, postId, patch),
      );
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
        { queryKey: ["user-posts"] },
        (old) => patchPostInInfinite(old, postId, patch),
      );
      queryClient.setQueryData<Post>(["post", postId], (old) =>
        old ? { ...old, ...patch } : old,
      );
    };

    const prependPostToCache = (queryKey: unknown[], post: Post) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
        { queryKey },
        (old) => {
          if (!old?.pages) return old;
          const firstPage = old.pages[0];
          if (!firstPage) return old;
          if (firstPage.data.some((p) => p.id === post.id)) return old;
          return {
            ...old,
            pages: [
              { ...firstPage, data: [post, ...firstPage.data] },
              ...old.pages.slice(1),
            ],
          };
        },
      );
    };

    // ── Post handlers ─────────────────────────────────────────
    const onPostCreatedByMe = (payload: SocketPostCreatedByMePayload) => {
      prependPostToCache(["feed"], payload.post);
      prependPostToCache(["user-posts", user?.id], payload.post);
    };

    const onFeedNewPost = (payload: SocketPostCreatedByMePayload) => {
      prependPostToCache(["feed"], payload.post);
    };

    const onPostUpdated = (payload: PostUpdatedPayload) => {
      patchPostInAllCaches(payload.postId, {
        content: payload.content ?? undefined,
        privacy: payload.privacy as Post["privacy"],
        updatedAt: payload.updatedAt,
      });
    };

    const onPostDeleted = (payload: PostDeletedPayload) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
        { queryKey: ["feed"] },
        (old) => removePostFromInfinite(old, payload.postId),
      );
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
        { queryKey: ["user-posts"] },
        (old) => removePostFromInfinite(old, payload.postId),
      );
      queryClient.removeQueries({ queryKey: ["post", payload.postId] });
    };

    // ── Reaction handler ──────────────────────────────────────
    const onPostReaction = (p: PostReactionPayload) => {
      // likesCount sync — skip nếu là mình vì optimistic update đã xử lý
      if (p.userId !== user?.id) {
        patchPostInAllCaches(p.postId, { likesCount: p.likesCount });
      }

      // reaction-summary
      queryClient.setQueryData<ReactionSummary>(
        ["reaction-summary", p.postId],
        (old) => {
          if (!old) return old;
          const byType = { ...old.byType };
          const isMe = p.userId === user?.id;

          if (p.action === "created" && p.reactionType) {
            byType[p.reactionType] = (byType[p.reactionType] ?? 0) + 1;
            return {
              total: old.total + 1,
              byType,
              myReaction: isMe ? p.reactionType : old.myReaction,
            };
          }
          if (p.action === "deleted" && p.previousType) {
            byType[p.previousType] = Math.max(
              0,
              (byType[p.previousType] ?? 1) - 1,
            );
            return {
              total: Math.max(0, old.total - 1),
              byType,
              myReaction: isMe ? null : old.myReaction,
            };
          }
          if (p.action === "updated" && p.reactionType && p.previousType) {
            byType[p.previousType] = Math.max(
              0,
              (byType[p.previousType] ?? 1) - 1,
            );
            byType[p.reactionType] = (byType[p.reactionType] ?? 0) + 1;
            return {
              total: old.total,
              byType,
              myReaction: isMe ? p.reactionType : old.myReaction,
            };
          }
          return old;
        },
      );

      // reactions list (modal danh sách reaction)
      queryClient.setQueryData<InfiniteData<PaginatedResponse<Reaction>>>(
        ["reactions", p.postId],
        (old) => {
          if (!old) return old;

          if (p.action === "created" && p.user) {
            const firstPage = old.pages[0];
            if (!firstPage) return old;
            if (firstPage.data.some((r) => r.userId === p.userId)) return old;
            const newReaction: Reaction = {
              id: `temp-${p.userId}`,
              userId: p.userId,
              postId: p.postId,
              type: p.reactionType!,
              createdAt: new Date().toISOString(),
              user: p.user,
            };
            return {
              ...old,
              pages: [
                { ...firstPage, data: [newReaction, ...firstPage.data] },
                ...old.pages.slice(1),
              ],
            };
          }
          if (p.action === "deleted") {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((r) => r.userId !== p.userId),
              })),
            };
          }
          if (p.action === "updated" && p.reactionType) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((r) =>
                  r.userId === p.userId ? { ...r, type: p.reactionType! } : r,
                ),
              })),
            };
          }
          return old;
        },
      );
    };

    // ── Comment handlers ──────────────────────────────────────
    const onNewComment = ({ postId, comment }: NewCommentPayload) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<Comment>>>(
        { queryKey: ["comments", postId] },
        (old) => {
          if (!old) return old;
          if (
            old.pages.some((page) => page.data.some((c) => c.id === comment.id))
          )
            return old;
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
    };

    const onNewReply = ({ postId, commentId, reply }: NewReplyPayload) => {
      queryClient.setQueryData<{ replies: Comment[] }>(
        ["replies", commentId],
        (old) => {
          if (!old) return old;
          if (old.replies.some((r) => r.id === reply.id)) return old;
          return { replies: [...old.replies, reply] };
        },
      );
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<Comment>>>(
        { queryKey: ["comments", postId] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((c) =>
                c.id === commentId
                  ? { ...c, _count: { replies: (c._count?.replies ?? 0) + 1 } }
                  : c,
              ),
            })),
          };
        },
      );
    };

    const onCommentUpdated = ({
      postId,
      commentId,
      content,
      parentId,
    }: CommentUpdatedPayload) => {
      if (parentId) {
        queryClient.setQueryData<{ replies: Comment[] }>(
          ["replies", parentId],
          (old) => {
            if (!old) return old;
            return {
              replies: old.replies.map((r) =>
                r.id === commentId ? { ...r, content } : r,
              ),
            };
          },
        );
      } else {
        queryClient.setQueriesData<InfiniteData<PaginatedResponse<Comment>>>(
          { queryKey: ["comments", postId] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((c) =>
                  c.id === commentId ? { ...c, content } : c,
                ),
              })),
            };
          },
        );
      }
    };

    const onCommentDeleted = ({
      postId,
      commentId,
      parentId,
      decrementBy,
    }: CommentDeletedPayload) => {
      if (parentId) {
        queryClient.setQueryData<{ replies: Comment[] }>(
          ["replies", parentId],
          (old) => {
            if (!old) return old;
            return { replies: old.replies.filter((r) => r.id !== commentId) };
          },
        );
        queryClient.setQueriesData<InfiniteData<PaginatedResponse<Comment>>>(
          { queryKey: ["comments", postId] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((c) =>
                  c.id === parentId
                    ? {
                        ...c,
                        _count: {
                          replies: Math.max(0, (c._count?.replies ?? 1) - 1),
                        },
                      }
                    : c,
                ),
              })),
            };
          },
        );
      } else {
        queryClient.setQueriesData<InfiniteData<PaginatedResponse<Comment>>>(
          { queryKey: ["comments", postId] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((c) => c.id !== commentId),
              })),
            };
          },
        );
        queryClient.removeQueries({ queryKey: ["replies", commentId] });
      }
      patchPostInAllCaches(postId, {
        commentsCount: Math.max(
          0,
          (queryClient.getQueryData<Post>(["post", postId])?.commentsCount ??
            decrementBy) - decrementBy,
        ),
      });
    };

    const onCommentsCount = ({
      postId,
      commentsCount,
    }: CommentsCountPayload) => {
      patchPostInAllCaches(postId, { commentsCount });
    };

    // ── Register ──────────────────────────────────────────────
    socket.on("post:created_by_me", onPostCreatedByMe);
    socket.on("feed:new_post", onFeedNewPost);
    socket.on("post:updated", onPostUpdated);
    socket.on("post:deleted", onPostDeleted);
    socket.on("post:reaction", onPostReaction);
    socket.on("post:new_comment", onNewComment);
    socket.on("post:new_reply", onNewReply);
    socket.on("post:comment_updated", onCommentUpdated);
    socket.on("post:comment_deleted", onCommentDeleted);
    socket.on("post:comments_count", onCommentsCount);

    return () => {
      socket.off("post:created_by_me", onPostCreatedByMe);
      socket.off("feed:new_post", onFeedNewPost);
      socket.off("post:updated", onPostUpdated);
      socket.off("post:deleted", onPostDeleted);
      socket.off("post:reaction", onPostReaction);
      socket.off("post:new_comment", onNewComment);
      socket.off("post:new_reply", onNewReply);
      socket.off("post:comment_updated", onCommentUpdated);
      socket.off("post:comment_deleted", onCommentDeleted);
      socket.off("post:comments_count", onCommentsCount);
    };
  }, [socket]); // eslint-disable-line
};
