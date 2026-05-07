import { useRef, useState } from "react";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { reactionsApi } from "../services/api-services";
import { toast } from "sonner";
import type {
  PaginatedResponse,
  Post,
  ReactionSummary,
  ReactionType,
} from "../types";
import { patchInfinitePages } from "../socket/utils";

export const useReactionMutation = (post: Post) => {
  const [showPicker, setShowPicker] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qc = useQueryClient();

  const myReaction: ReactionType | null = post.reactions[0]?.type ?? null;

  const calcOptimistic = (
    currentReaction: ReactionType | null,
    next: ReactionType,
  ) => {
    if (currentReaction === next) return { reactionType: null, delta: -1 };
    if (!currentReaction) return { reactionType: next, delta: +1 };
    return { reactionType: next, delta: 0 };
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (type: ReactionType) => reactionsApi.toggle(post.id, type),
    onMutate: async (type) => {
      await qc.cancelQueries({ queryKey: ["post", post.id] });
      await qc.cancelQueries({ queryKey: ["feed"] });
      await qc.cancelQueries({ queryKey: ["user-posts"] });

      const { reactionType, delta } = calcOptimistic(myReaction, type);

      const patchPost = (p: Post): Post => ({
        ...p,
        likesCount: p.likesCount + delta,
        reactions: reactionType ? [{ type: reactionType }] : [],
      });

      const snapPost = qc.getQueryData<Post>(["post", post.id]);
      const snapFeed = qc.getQueryData<InfiniteData<PaginatedResponse<Post>>>([
        "feed",
      ]);

      qc.setQueryData<Post>(["post", post.id], (old) =>
        old ? patchPost(old) : old,
      );

      const patchFeed = (
        old: InfiniteData<PaginatedResponse<Post>> | undefined,
      ) =>
        patchInfinitePages(old, (items) =>
          items.map((p) => (p.id === post.id ? patchPost(p) : p)),
        );

      qc.setQueryData<InfiniteData<PaginatedResponse<Post>>>(
        ["feed"],
        patchFeed,
      );
      qc.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
        { queryKey: ["user-posts"] },
        patchFeed,
      );

      qc.setQueryData<ReactionSummary>(["reaction-summary", post.id], (old) => {
        const base = old ?? {
          total: 0,
          myReaction: null,
          byType: { LIKE: 0, LOVE: 0, HAHA: 0, WOW: 0, SAD: 0, ANGRY: 0 },
        };

        return {
          ...base,
          total: base.total + delta,
          myReaction: reactionType,
          byType: {
            ...base.byType,
            ...(myReaction
              ? {
                  [myReaction]: Math.max(0, (base.byType[myReaction] ?? 0) - 1),
                }
              : {}),
            ...(reactionType
              ? { [reactionType]: (base.byType[reactionType] ?? 0) + 1 }
              : {}),
          },
        };
      });

      return { snapPost, snapFeed };
    },

    onError: (_err, _type, ctx) => {
      toast.error("Không thể thực hiện cảm xúc");
      if (!ctx) return;
      if (ctx.snapPost) qc.setQueryData(["post", post.id], ctx.snapPost);
      if (ctx.snapFeed) qc.setQueryData(["feed"], ctx.snapFeed);
    },
  });

  const clearLeaveTimer = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };

  const handleMouseEnter = () => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setShowPicker(true), 500);
  };

  const handleMouseLeave = () => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setShowPicker(false), 300);
  };

  const handleLikeClick = () => {
    if (isPending) return;
    setShowPicker(false);
    mutate(myReaction ?? "LIKE");
  };

  const handlePickerSelect = (type: ReactionType) => {
    if (isPending) return;
    setShowPicker(false);
    mutate(type);
  };

  return {
    myReaction,
    showPicker,
    isPending,
    handleMouseEnter,
    handleMouseLeave,
    handleLikeClick,
    handlePickerSelect,
    clearLeaveTimer,
  };
};
