import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  friendRequestCount: number;

  setUnreadCount: (n: number) => void;
  increment: () => void;
  decrement: (by?: number) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;

  setFriendRequestCount: (n: number) => void;
  incrementFriendRequest: () => void;
  decrementFriendRequest: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  friendRequestCount: 0,

  setUnreadCount: (n) => set({ unreadCount: n }),

  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

  decrement: (by = 1) =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),

  markRead: (_id) =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),

  markAllRead: () => set({ unreadCount: 0 }),

  setFriendRequestCount: (n) => set({ friendRequestCount: n }),

  incrementFriendRequest: () =>
    set((s) => ({ friendRequestCount: s.friendRequestCount + 1 })),

  decrementFriendRequest: () =>
    set((s) => ({ friendRequestCount: Math.max(0, s.friendRequestCount - 1) })),
}));
