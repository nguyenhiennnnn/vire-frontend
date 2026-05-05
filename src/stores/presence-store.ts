import { create } from "zustand";

interface PresenceState {
  onlineIds: Set<string>;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
  setMany: (userIds: string[]) => void;
  clear: () => void;
  isOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineIds: new Set(),

  setOnline: (userId) =>
    set((s) => ({ onlineIds: new Set(s.onlineIds).add(userId) })),

  setOffline: (userId) =>
    set((s) => {
      const next = new Set(s.onlineIds);
      next.delete(userId);
      return { onlineIds: next };
    }),

  setMany: (userIds) =>
    set((s) => {
      const next = new Set(s.onlineIds);
      userIds.forEach((id) => next.add(id));
      return { onlineIds: next };
    }),

  clear: () => set({ onlineIds: new Set() }),

  isOnline: (userId) => get().onlineIds.has(userId),
}));
