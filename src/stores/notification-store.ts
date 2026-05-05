import { create } from "zustand";
import type { Notification } from "../types";

interface NotificationState {
  unreadCount: number;
  realtimeItems: Notification[];
  friendRequestCount: number;

  setUnreadCount: (n: number) => void;
  incrementUnread: () => void;
  decrementUnread: (by?: number) => void;
  addNotification: (notif: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setFriendRequestCount: (n: number) => void;
  incrementFriendRequest: () => void;
  decrementFriendRequest: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  realtimeItems: [],
  friendRequestCount: 0,

  setUnreadCount: (n) => set({ unreadCount: n }),

  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

  decrementUnread: (by = 1) =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),

  addNotification: (notif) =>
    set((s) => ({ realtimeItems: [notif, ...s.realtimeItems] })),

  markRead: (id) =>
    set((s) => ({
      realtimeItems: s.realtimeItems.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    })),

  markAllRead: () =>
    set((s) => ({
      unreadCount: 0,
      realtimeItems: s.realtimeItems.map((n) => ({ ...n, isRead: true })),
    })),

  setFriendRequestCount: (n) => set({ friendRequestCount: n }),

  incrementFriendRequest: () =>
    set((s) => ({ friendRequestCount: s.friendRequestCount + 1 })),

  decrementFriendRequest: () =>
    set((s) => ({ friendRequestCount: Math.max(0, s.friendRequestCount - 1) })),
}));
