import type { InfiniteData } from "@tanstack/react-query";
import type { PaginatedResponse } from "../types";

export const patchInfinitePages = <T>(
  old: InfiniteData<PaginatedResponse<T>> | undefined,
  fn: (items: T[]) => T[],
): InfiniteData<PaginatedResponse<T>> | undefined => {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({ ...page, data: fn(page.data) })),
  };
};

export const prependToInfinite = <T>(
  old: InfiniteData<PaginatedResponse<T>> | undefined,
  item: T,
): InfiniteData<PaginatedResponse<T>> | undefined => {
  if (!old) return old;
  return {
    ...old,
    pages: [
      { ...old.pages[0], data: [item, ...old.pages[0].data] },
      ...old.pages.slice(1),
    ],
  };
};

export const removeFromInfinite = <T extends { id: string }>(
  old: InfiniteData<PaginatedResponse<T>> | undefined,
  id: string,
): InfiniteData<PaginatedResponse<T>> | undefined =>
  patchInfinitePages(old, (items) => items.filter((item) => item.id !== id));
