import { useState, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Image, Smile, Tag } from "lucide-react";
import { postsApi } from "../services/api-services";
import { useInfiniteScroll } from "../hooks/use-infinite-scroll";
import { useAuth } from "../hooks/use-auth";
import { StoriesBar } from "../components/story/stories-bar";
import { PostCard } from "../components/post/post-card";
import { PostCardSkeleton } from "../components/shared/skeleton-card";
import { CreatePostDialog } from "../components/post/create-post-dialog";
import { UserAvatar } from "../components/shared/user-avatar";
import { useFeedNewPosts } from "../hooks/use-feed-new-posts";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [createWithMedia, setCreateWithMedia] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useFeedNewPosts({ onScrollToTop: scrollToTop });

  // ── Infinite feed query ─────────────────────────────────────────────────────
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["feed"],
      queryFn: ({ pageParam }) =>
        postsApi.getFeed(pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
    });

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const posts = data?.pages.flatMap((p) => p.data) ?? [];

  const openCreate = (withMedia = false) => {
    setCreateWithMedia(withMedia);
    setCreateOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-xl border p-3">
        <StoriesBar />
      </div>

      {user && (
        <div className="bg-card rounded-xl border p-3 space-y-3">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => openCreate(false)}
          >
            <UserAvatar user={user} size="md" />
            <div className="flex-1 bg-muted hover:bg-muted/70 transition-colors rounded-full px-4 py-2 text-sm text-muted-foreground select-none">
              Bạn đang nghĩ gì, {user.username}?
            </div>
          </div>

          <div className="flex items-center gap-1 border-t pt-2">
            <QuickAction
              icon={<Image size={17} className="text-primary" />}
              label="Ảnh/Video"
              onClick={() => openCreate(true)}
            />
            <QuickAction
              icon={<Tag size={17} className="text-primary/70" />}
              label="Tag bạn bè"
              onClick={() => openCreate(false)}
            />
            <QuickAction
              icon={<Smile size={17} className="text-primary/50" />}
              label="Cảm xúc"
              onClick={() => openCreate(false)}
            />
          </div>
        </div>
      )}

      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isFetchingNextPage && <PostCardSkeleton />}

      <div ref={sentinelRef} />

      {!isLoading && !hasNextPage && posts.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          Bạn đã xem hết bài viết 🎉
        </p>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-16 space-y-1.5">
          <p className="text-muted-foreground text-sm font-medium">
            Chưa có bài viết nào.
          </p>
          <p className="text-muted-foreground text-xs">
            Kết bạn hoặc theo dõi ai đó để xem bài viết của họ.
          </p>
        </div>
      )}

      <CreatePostDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialMediaOpen={createWithMedia}
      />
    </div>
  );
}
