import { useEffect, useRef } from "react";

interface Options {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 0.1,
  rootMargin = "0px",
}: Options) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold, rootMargin]);

  return sentinelRef;
};
