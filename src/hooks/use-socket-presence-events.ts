import { useEffect } from "react";
import { useSocketStore } from "../stores/socket-store";
import { usePresenceStore } from "../stores/presence-store";

export const useSocketPresenceEvents = () => {
  const { socket } = useSocketStore();
  const { setOnline, setOffline } = usePresenceStore();

  useEffect(() => {
    if (!socket) return;

    const onUserOnline = ({ userId }: { userId: string }) => setOnline(userId);
    const onUserOffline = ({ userId }: { userId: string }) =>
      setOffline(userId);

    socket.on("user:online", onUserOnline);
    socket.on("user:offline", onUserOffline);

    return () => {
      socket.off("user:online", onUserOnline);
      socket.off("user:offline", onUserOffline);
    };
  }, [socket]); // eslint-disable-line
};
