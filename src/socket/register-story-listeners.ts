import type { Socket } from "socket.io-client";
import type { QueryClient } from "@tanstack/react-query";
import type { Story, StoryGroup, UserCard } from "../types";

interface Deps {
  socket: Socket;
  qc: QueryClient;
  myId: string;
}

export const storyEvents = new EventTarget();

export const registerStoryListeners = ({ socket, qc, myId }: Deps) => {
  socket.on("story:you_created", ({ story }: { story: Story }) => {
    qc.setQueryData<StoryGroup[]>(["stories-feed"], (old) => {
      if (!old) return old;
      const idx = old.findIndex((g) => g.user.id === myId);
      if (idx === -1) {
        return [
          { user: story.user!, stories: [story], hasUnread: false },
          ...old,
        ];
      }
      return old.map((g, i) =>
        i === idx ? { ...g, stories: [story, ...g.stories] } : g,
      );
    });
    qc.invalidateQueries({ queryKey: ["my-stories"] });
  });

  socket.on("story:new", ({ story }: { story: Story }) => {
    qc.setQueryData<StoryGroup[]>(["stories-feed"], (old) => {
      if (!old) return old;
      const idx = old.findIndex((g) => g.user.id === story.userId);
      if (idx === -1) {
        return [
          ...old,
          { user: story.user!, stories: [story], hasUnread: true },
        ];
      }
      return old.map((g, i) =>
        i === idx
          ? { ...g, stories: [story, ...g.stories], hasUnread: true }
          : g,
      );
    });
  });

  socket.on("story:you_deleted", ({ storyId }: { storyId: string }) => {
    qc.setQueryData<StoryGroup[]>(["stories-feed"], (old) => {
      if (!old) return old;
      return old
        .map((g) =>
          g.user.id === myId
            ? { ...g, stories: g.stories.filter((s) => s.id !== storyId) }
            : g,
        )
        .filter((g) => g.stories.length > 0);
    });
    qc.invalidateQueries({ queryKey: ["my-stories"] });
  });

  socket.on(
    "story:removed_from_tray",
    ({ storyId, userId: ownerId }: { storyId: string; userId: string }) => {
      qc.setQueryData<StoryGroup[]>(["stories-feed"], (old) => {
        if (!old) return old;
        return old
          .map((g) =>
            g.user.id === ownerId
              ? { ...g, stories: g.stories.filter((s) => s.id !== storyId) }
              : g,
          )
          .filter((g) => g.stories.length > 0);
      });
    },
  );

  socket.on("story:expired", ({ storyId }: { storyId: string }) => {
    qc.setQueryData<StoryGroup[]>(["stories-feed"], (old) => {
      if (!old) return old;
      return old
        .map((g) =>
          g.user.id === myId
            ? { ...g, stories: g.stories.filter((s) => s.id !== storyId) }
            : g,
        )
        .filter((g) => g.stories.length > 0);
    });
    qc.invalidateQueries({ queryKey: ["my-stories"] });
  });

  socket.on("story:viewed", ({ storyId, viewer, viewedAt }) => {
    qc.setQueryData<{
      viewers: Array<{ user: UserCard; viewedAt: string }>;
      totalViews: number;
    }>(["story-viewers", storyId], (old) => {
      if (!old) return old;
      if (old.viewers.some((v) => v.user.id === viewer.id)) return old;
      return {
        viewers: [{ user: viewer, viewedAt }, ...old.viewers],
        totalViews: old.totalViews + 1,
      };
    });

    qc.setQueryData<StoryGroup[]>(["stories-feed"], (old) => {
      if (!old) return old;
      return old.map((g) => ({
        ...g,
        stories: g.stories.map((s) =>
          s.id === storyId ? { ...s, viewsCount: (s.viewsCount ?? 0) + 1 } : s,
        ),
      }));
    });
  });

  socket.on("story:deleted", ({ storyId }: { storyId: string }) => {
    storyEvents.dispatchEvent(
      new CustomEvent("story_deleted", { detail: { storyId } }),
    );
  });
};
