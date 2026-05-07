import { create } from "zustand";

interface OnlineStore {
  onlineUsers: Set<string>;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
  isOnline: (userId: string) => boolean;
  hydrate: (userIds: string[]) => void;
}

export const useOnlineStore = create<OnlineStore>((set, get) => ({
  onlineUsers: new Set(),

  setOnline: (userId) =>
    set((s) => ({ onlineUsers: new Set(s.onlineUsers).add(userId) })),

  setOffline: (userId) =>
    set((s) => {
      const next = new Set(s.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  isOnline: (userId) => get().onlineUsers.has(userId),

  hydrate: (userIds) => set({ onlineUsers: new Set(userIds) }),
}));
