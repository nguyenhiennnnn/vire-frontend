import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Play, Trash2 } from "lucide-react";
import { storiesApi } from "../../../services/api-services";
import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";
import { StoryViewer } from "../../story/story-viewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import type { FriendshipStatus, Story, StoryGroup } from "../../../types";
import { useDeleteStoryMutation } from "../../../hooks/use-story-mutations";

interface Props {
  userId: string;
  username: string;
  isOwn: boolean;
  friendshipStatus: FriendshipStatus;
}

function StorySkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`sk-${i}`}
          className="aspect-9/16 rounded-xl bg-muted animate-pulse"
        />
      ))}
    </div>
  );
}

function MediaThumb({ story }: { story: Story }) {
  if (story.mediaType === "VIDEO") {
    return (
      <>
        <video
          src={story.mediaUrl}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
            <Play size={16} className="text-black fill-black ml-0.5" />
          </div>
        </div>
      </>
    );
  }
  return (
    <img src={story.mediaUrl} alt="" className="w-full h-full object-cover" />
  );
}

function StoryCard({
  story,
  index,
  onView,
  onDelete,
}: {
  story: Story;
  index: number;
  onView: (i: number) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="relative group aspect-9/16 rounded-xl overflow-hidden bg-muted">
      <MediaThumb story={story} />

      {story.isExpired ? (
        <div className="absolute inset-0 bg-foreground/50 flex items-end p-2">
          <span className="text-[10px] bg-foreground/60 text-background px-1.5 py-0.5 rounded">
            Đã hết hạn
          </span>
        </div>
      ) : (
        <button
          onClick={() => onView(index)}
          className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors"
        />
      )}

      <button
        onClick={() => onDelete(story.id)}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-foreground/60 text-background opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export const ProfileStoriesTab = ({
  userId,
  username,
  isOwn,
  friendshipStatus,
}: Props) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerInitIndex, setViewerInitIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const {
    data: myStoriesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingOwn,
  } = useInfiniteQuery({
    queryKey: ["my-stories"],
    queryFn: ({ pageParam }) =>
      storiesApi.getMine(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (l) => l.nextCursor ?? undefined,
    enabled: isOwn,
  });

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  const myStories = myStoriesData?.pages.flatMap((p) => p.data) ?? [];

  const myGroup: StoryGroup | null =
    myStories.length > 0
      ? {
          user: { id: userId, username, avatar: null },
          stories: myStories.filter((s) => !s.isExpired),
          hasUnread: false,
        }
      : null;

  const { data: activeStories = [], isLoading: loadingActive } = useQuery({
    queryKey: ["active-stories", userId],
    queryFn: () => storiesApi.getActive(userId),
    enabled: !isOwn && friendshipStatus === "accepted",
  });

  const friendGroup: StoryGroup | null =
    activeStories.length > 0
      ? {
          user: { id: userId, username, avatar: null },
          stories: activeStories,
          hasUnread: activeStories.some((s) => !s.isViewed),
        }
      : null;

  const deleteStoryMutation = useDeleteStoryMutation({
    onSuccess: () => setDeleteTarget(null),
  });

  const openViewer = (i: number) => {
    setViewerInitIndex(i);
    setViewerOpen(true);
  };

  if (isOwn) {
    return (
      <>
        {loadingOwn && <StorySkeleton count={6} />}
        {!loadingOwn && myStories.length === 0 && (
          <p className="text-center py-12 text-sm text-muted-foreground">
            Chưa có story nào
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {myStories.map((s, i) => (
            <StoryCard
              key={s.id}
              story={s}
              index={i}
              onView={openViewer}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>

        {isFetchingNextPage && (
          <p className="text-center py-4 text-sm text-muted-foreground">
            Đang tải...
          </p>
        )}
        <div ref={sentinelRef} />

        {myGroup && (
          <StoryViewer
            open={viewerOpen}
            onClose={() => setViewerOpen(false)}
            groups={[myGroup]}
            initialGroupIndex={viewerInitIndex}
          />
        )}

        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xoá story?</AlertDialogTitle>
              <AlertDialogDescription>
                Story sẽ bị xoá vĩnh viễn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() =>
                  deleteTarget && deleteStoryMutation.mutate(deleteTarget)
                }
                disabled={deleteStoryMutation.isPending}
              >
                Xoá
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  if (friendshipStatus !== "accepted") {
    return (
      <p className="text-center py-12 text-sm text-muted-foreground">
        Chỉ bạn bè mới xem được story
      </p>
    );
  }

  if (loadingActive) return <StorySkeleton count={3} />;

  if (activeStories.length === 0) {
    return (
      <p className="text-center py-12 text-sm text-muted-foreground">
        Không có story nào đang hoạt động
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {activeStories.map((s, i) => (
          <button
            key={s.id}
            onClick={() => openViewer(i)}
            className="relative aspect-9/16 rounded-xl overflow-hidden bg-muted"
          >
            <MediaThumb story={s} />
          </button>
        ))}
      </div>

      {friendGroup && (
        <StoryViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          groups={[friendGroup]}
          initialGroupIndex={viewerInitIndex}
        />
      )}
    </>
  );
};
