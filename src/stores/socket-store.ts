import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { usePresenceStore } from "./presence-store";

interface SocketState {
  socket: Socket | null;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,

  connect: (token) => {
    if (get().socket?.connected) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      withCredentials: true,
    });

    const { setOnline, setOffline } = usePresenceStore.getState();

    socket.on("user:online", ({ userId }: { userId: string }) => {
      setOnline(userId);
    });

    socket.on("user:offline", ({ userId }: { userId: string }) => {
      setOffline(userId);
    });

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    usePresenceStore.getState().clear();
    set({ socket: null });
  },
}));
