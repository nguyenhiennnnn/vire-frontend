import { useEffect } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useSocketStore } from "../stores/socket-store";
import { usePresenceStore } from "../stores/presence-store";

export const useSocketConnection = () => {
  const { user, accessToken } = useAuthStore();
  const { connect, disconnect, socket } = useSocketStore();
  const { clear: clearPresence } = usePresenceStore();

  // ── Connect / disconnect ────────────────────────────────────
  useEffect(() => {
    if (!user || !accessToken) return;
    connect(accessToken);
    return () => {
      disconnect();
      clearPresence();
    };
  }, [user?.id, accessToken]); // eslint-disable-line

  // ── Connection lifecycle events ─────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleDisconnect = (_reason: string) => clearPresence();
    const handleConnectError = () => clearPresence();

    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket]); // eslint-disable-line
};
