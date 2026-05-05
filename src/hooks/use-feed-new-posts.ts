import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocketStore } from "../stores/socket-store";
import type { Post } from "../types";

interface FeedNewPostPayload {
  post: Post;
}

interface UseFeedNewPostsOptions {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  onScrollToTop?: () => void;
}

export function useFeedNewPosts({
  scrollContainerRef,
  onScrollToTop,
}: UseFeedNewPostsOptions = {}) {
  const { socket } = useSocketStore();
  const queryClient = useQueryClient();

  const pendingRef = useRef<Post[]>([]);
  const toastIdRef = useRef<string | number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pendingCount, setPendingCount] = useState(0);

  const SCROLL_THRESHOLD = 120;

  const isScrolledDown = useCallback(() => {
    if (scrollContainerRef?.current) {
      return scrollContainerRef.current.scrollTop > SCROLL_THRESHOLD;
    }
    return window.scrollY > SCROLL_THRESHOLD;
  }, [scrollContainerRef]);

  const mergePostsIntoCache = useCallback(
    (posts: Post[]) => {
      if (!posts.length) return;
      queryClient.setQueriesData<any>({ queryKey: ["feed"] }, (old: any) => {
        if (!old?.pages) return old;
        const existingIds = new Set<string>(
          old.pages.flatMap((p: any) => p.data.map((post: Post) => post.id)),
        );
        const fresh = posts.filter((p) => !existingIds.has(p.id));
        if (!fresh.length) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [...fresh, ...(old.pages[0]?.data ?? [])],
            },
            ...old.pages.slice(1),
          ],
        };
      });
    },
    [queryClient],
  );

  const clearToast = useCallback(() => {
    if (toastIdRef.current != null) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    pendingRef.current = [];
    setPendingCount(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const showBatchedToast = useCallback(
    (posts: Post[]) => {
      const names = [
        ...new Set(posts.map((p) => p.user?.username).filter(Boolean)),
      ];
      const count = posts.length;
      const title =
        count === 1
          ? `${names[0]} vừa đăng bài viết mới`
          : `${count} bài viết mới`;
      const description =
        names.length <= 2
          ? `Từ ${names.join(" và ")}`
          : `Từ ${names[0]}, ${names[1]} và ${names.length - 2} người khác`;

      const handleClick = () => {
        const batch = [...pendingRef.current];
        clearToast();
        mergePostsIntoCache(batch);
        if (onScrollToTop) {
          onScrollToTop();
        } else if (scrollContainerRef?.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      };

      const toastOptions = {
        description,
        duration: Infinity,
        action: { label: "Xem ngay", onClick: handleClick },
        onDismiss: () => {
          mergePostsIntoCache(pendingRef.current);
          pendingRef.current = [];
          setPendingCount(0);
          toastIdRef.current = null;
        },
      };

      if (toastIdRef.current != null) {
        toast(title, { id: toastIdRef.current, ...toastOptions });
      } else {
        toastIdRef.current = toast(title, toastOptions);
      }
    },
    [clearToast, mergePostsIntoCache, onScrollToTop, scrollContainerRef],
  );

  useEffect(() => {
    if (!socket) return;

    const onNewPost = ({ post }: FeedNewPostPayload) => {
      if (!isScrolledDown()) {
        mergePostsIntoCache([post]);
        return;
      }

      pendingRef.current = [post, ...pendingRef.current];
      setPendingCount(pendingRef.current.length);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        showBatchedToast(pendingRef.current);
      }, 400);
    };

    socket.on("feed:new_post", onNewPost);
    return () => {
      socket.off("feed:new_post", onNewPost);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [socket, isScrolledDown, mergePostsIntoCache, showBatchedToast]);

  const flushPending = useCallback(() => {
    mergePostsIntoCache(pendingRef.current);
    clearToast();
  }, [mergePostsIntoCache, clearToast]);

  return { pendingCount, flushPending };
}
