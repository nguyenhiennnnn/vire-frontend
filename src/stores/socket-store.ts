import { create } from "zustand";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "");

interface SocketState {
  socket: Socket | null;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,

  connect: (token) => {
    const current = get().socket;
    if (current?.connected) return;

    // Cleanup socket cũ
    if (current) {
      current.removeAllListeners();
      current.disconnect();
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    set({ socket });
  },

  disconnect: () => {
    const current = get().socket;
    if (current) {
      current.removeAllListeners();
      current.disconnect();
    }
    set({ socket: null });
  },
}));
