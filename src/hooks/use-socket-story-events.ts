import { useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth-store";
import { useSocketStore } from "../stores/socket-store";
import type {
  Story,
  StoryGroup,
  StoryViewerItem,
  SocketStoryNewPayload,
  SocketStoryDeletedPayload,
  SocketStoryCreatedByMePayload,
  SocketStoryDeletedByMePayload,
  SocketStoryViewedPayload,
  PaginatedResponse,
} from "../types";

/** Lắng nghe tất cả sự kiện liên quan tới Story. */
export const useSocketStoryEvents = () => {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // ── Helpers ───────────────────────────────────────────────
    const setStoriesFeed = (
      updater: (
        old: { storyGroups: StoryGroup[] } | undefined,
      ) => { storyGroups: StoryGroup[] } | undefined,
    ) =>
      queryClient.setQueryData<{ storyGroups: StoryGroup[] }>(
        ["stories-feed"],
        updater,
      );

    const setMyStories = (
      updater: (
        old: PaginatedResponse<Story> | undefined,
      ) => PaginatedResponse<Story> | undefined,
    ) =>
      queryClient.setQueryData<PaginatedResponse<Story>>(
        ["my-stories"],
        updater,
      );

    // ── Handlers ──────────────────────────────────────────────
    const onStoryNew = (payload: SocketStoryNewPayload) => {
      setStoriesFeed((old) => {
        const groups = old?.storyGroups ? [...old.storyGroups] : [];
        const idx = groups.findIndex((g) => g.user.id === payload.user.id);

        if (idx === -1) {
          const newGroup: StoryGroup = {
            user: payload.user,
            stories: [payload.story],
            hasUnread: true,
          };
          const myGroupIdx = groups.findIndex((g) => g.user.id === user?.id);
          if (myGroupIdx !== -1) {
            return {
              storyGroups: [
                groups[myGroupIdx],
                newGroup,
                ...groups.filter((_, i) => i !== myGroupIdx),
              ],
            };
          }
          return { storyGroups: [newGroup, ...groups] };
        }

        const updatedGroup: StoryGroup = {
          ...groups[idx],
          stories: [payload.story, ...groups[idx].stories],
          hasUnread: true,
        };
        const withoutUpdated = groups.filter((_, i) => i !== idx);
        const myGroupIdx = withoutUpdated.findIndex(
          (g) => g.user.id === user?.id,
        );
        if (myGroupIdx !== -1) {
          return {
            storyGroups: [
              withoutUpdated[myGroupIdx],
              updatedGroup,
              ...withoutUpdated.filter((_, i) => i !== myGroupIdx),
            ],
          };
        }
        return { storyGroups: [updatedGroup, ...withoutUpdated] };
      });

      toast(`${payload.user.username} vừa đăng một story mới`);
    };

    const onStoryDeleted = (payload: SocketStoryDeletedPayload) => {
      setStoriesFeed((old) => {
        if (!old) return old;
        const groups = old.storyGroups
          .map((group) => {
            if (group.user.id !== payload.userId) return group;
            const remaining = group.stories.filter(
              (s) => s.id !== payload.storyId,
            );
            if (remaining.length === 0) return null;
            return {
              ...group,
              stories: remaining,
              hasUnread: remaining.some((s) => !s.isViewed),
            };
          })
          .filter((g): g is StoryGroup => g !== null);
        return { storyGroups: groups };
      });
    };

    const onStoryCreatedByMe = (payload: SocketStoryCreatedByMePayload) => {
      setStoriesFeed((old) => {
        const groups = old?.storyGroups ? [...old.storyGroups] : [];
        const myGroupIdx = groups.findIndex((g) => g.user.id === user?.id);
        const storyWithViewed = { ...payload.story, isViewed: false };

        if (myGroupIdx === -1) {
          return {
            storyGroups: [
              {
                user: payload.user,
                stories: [storyWithViewed],
                hasUnread: false,
              },
              ...groups,
            ],
          };
        }

        const updatedMyGroup = {
          ...groups[myGroupIdx],
          stories: [storyWithViewed, ...groups[myGroupIdx].stories],
        };
        return {
          storyGroups: [
            updatedMyGroup,
            ...groups.filter((_, i) => i !== myGroupIdx),
          ],
        };
      });

      setMyStories((old) => {
        if (!old) return old;
        if (old.data.some((s) => s.id === payload.story.id)) return old;
        return { ...old, data: [payload.story, ...old.data] };
      });
    };

    const onStoryDeletedByMe = (payload: SocketStoryDeletedByMePayload) => {
      setStoriesFeed((old) => {
        if (!old) return old;
        const groups = old.storyGroups
          .map((group) => {
            if (group.user.id !== payload.userId) return group;
            const remaining = group.stories.filter(
              (s) => s.id !== payload.storyId,
            );
            if (remaining.length === 0) return null;
            return { ...group, stories: remaining };
          })
          .filter((g): g is StoryGroup => g !== null);
        return { storyGroups: groups };
      });

      setMyStories((old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((s) => s.id !== payload.storyId),
        };
      });
    };

    const onStoryViewed = (payload: SocketStoryViewedPayload) => {
      queryClient.setQueryData<{
        viewers: StoryViewerItem[];
        totalViews: number;
      }>(["story-viewers", payload.storyId], (old) => {
        if (!old) return old;
        const alreadyIn = old.viewers.some(
          (v) => v.user.id === payload.viewer?.id,
        );
        if (alreadyIn) return { ...old, totalViews: payload.viewsCount };
        return {
          viewers: payload.viewer
            ? [
                { user: payload.viewer, viewedAt: new Date().toISOString() },
                ...old.viewers,
              ]
            : old.viewers,
          totalViews: payload.viewsCount,
        };
      });

      setMyStories((old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((s) =>
            s.id === payload.storyId
              ? { ...s, viewsCount: payload.viewsCount }
              : s,
          ),
        };
      });
    };

    // ── Register ──────────────────────────────────────────────
    socket.on("story:new", onStoryNew);
    socket.on("story:deleted", onStoryDeleted);
    socket.on("story:created_by_me", onStoryCreatedByMe);
    socket.on("story:deleted_by_me", onStoryDeletedByMe);
    socket.on("story:viewed", onStoryViewed);

    return () => {
      socket.off("story:new", onStoryNew);
      socket.off("story:deleted", onStoryDeleted);
      socket.off("story:created_by_me", onStoryCreatedByMe);
      socket.off("story:deleted_by_me", onStoryDeletedByMe);
      socket.off("story:viewed", onStoryViewed);
    };
  }, [socket]); // eslint-disable-line
};
