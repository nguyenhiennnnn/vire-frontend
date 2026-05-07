import { create } from "zustand";
import type { Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;

  setSocket: (socket: Socket | null) => void;
  setConnected: (v: boolean) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,

  setSocket: (socket) => set({ socket }),
  setConnected: (isConnected) => set({ isConnected }),
}));
