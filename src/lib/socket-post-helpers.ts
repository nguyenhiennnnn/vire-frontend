import type { InfiniteData } from "@tanstack/react-query";
import type { PaginatedResponse, Post } from "../types";

/** Patch một single Post trong InfiniteData<PaginatedResponse<Post>> */
export function patchPostInInfinite(
  old: InfiniteData<PaginatedResponse<Post>> | undefined,
  postId: string,
  patch: Partial<Post>,
): InfiniteData<PaginatedResponse<Post>> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: page.data.map((p) => (p.id === postId ? { ...p, ...patch } : p)),
    })),
  };
}

/** Remove một post khỏi InfiniteData<PaginatedResponse<Post>> */
export function removePostFromInfinite(
  old: InfiniteData<PaginatedResponse<Post>> | undefined,
  postId: string,
): InfiniteData<PaginatedResponse<Post>> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: page.data.filter((p) => p.id !== postId),
    })),
  };
}
