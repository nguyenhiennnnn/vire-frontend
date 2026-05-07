import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { storiesApi } from "../../services/api-services";
import { useAuth } from "../../hooks/use-auth";
import { UserAvatar } from "../shared/user-avatar";
import { OnlineBadge } from "../shared/online-badge";
import { StoryBubble } from "./story-bubble";
import { StoryViewer } from "./story-viewer";
import { AddStoryDialog } from "./add-story-dialog";
import type { StoryGroup } from "../../types";

export const StoriesBar = () => {
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  const { data: storyGroups = [] } = useQuery<StoryGroup[]>({
    queryKey: ["stories-feed"],
    queryFn: storiesApi.getFeed,
  });

  const openViewer = (groupIndex: number) => {
    setViewerStartIndex(groupIndex);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto scrollbar-none p-1">
        {user && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="relative">
              <UserAvatar user={user} size="lg" />
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background z-10">
                <Plus size={11} strokeWidth={3} />
              </span>
            </div>
            <span className="text-xs text-muted-foreground w-14 truncate text-center">
              Story của bạn
            </span>
          </button>
        )}

        {storyGroups.map((group, i) => (
          <div key={group.user.id} className="relative">
            <StoryBubble
              user={group.user}
              hasUnread={group.hasUnread}
              onClick={() => openViewer(i)}
            />
            <OnlineBadge
              userId={group.user.id}
              size="sm"
              className="absolute bottom-5 right-0 z-10 border-2 border-background"
            />
          </div>
        ))}
      </div>

      <AddStoryDialog open={addOpen} onClose={() => setAddOpen(false)} />

      {viewerOpen && storyGroups.length > 0 && (
        <StoryViewer
          key={viewerStartIndex}
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          groups={storyGroups}
          initialGroupIndex={viewerStartIndex}
        />
      )}
    </>
  );
};
