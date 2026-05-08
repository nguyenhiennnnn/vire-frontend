import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "../stores/auth-store";
import { useOnlineStore } from "../stores/online-store";
import { useNotificationStore } from "../stores/notification-store";
import { useSocketStore } from "../stores/socket-store";

import { registerPresenceListeners } from "../socket/register-presence-listeners";
import { registerNotificationListeners } from "../socket/register-notification-listeners";
import { registerFeedListeners } from "../socket/register-feed-listeners";
import { registerReactionListeners } from "../socket/register-reaction-listeners";
import { registerFriendListeners } from "../socket/register-friend-listeners";
import { registerFollowListeners } from "../socket/register-follow-listeners";
import { registerStoryListeners } from "../socket/register-story-listeners";
import { registerCommentListeners } from "../socket/register-comment-listeners";

export const useSocketInit = () => {
  const qc = useQueryClient();
  const { accessToken, user } = useAuthStore();
  const { setOnline, setOffline, hydrate } = useOnlineStore();
  const { setUnreadCount, incrementFriendRequest, decrementFriendRequest } =
    useNotificationStore();
  const { setSocket, setConnected } = useSocketStore();

  const myId = user?.id;

  useEffect(() => {
    if (!accessToken || !myId) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL as string, {
      auth: { token: accessToken },
      withCredentials: true,
    });

    setSocket(socket);

    socket.on("connect", () => {
      console.log("[socket] connected", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] connect_error", err.message);
    });

    registerPresenceListeners({ socket, setOnline, setOffline, hydrate });
    registerNotificationListeners({ socket, qc, setUnreadCount });
    registerFeedListeners({ socket, qc });
    registerReactionListeners({ socket, qc, myId });
    registerCommentListeners({ socket, qc });
    registerFriendListeners({
      socket,
      qc,
      myId,
      incrementFriendRequest,
      decrementFriendRequest,
    });
    registerFollowListeners({ socket, qc, myId });
    registerStoryListeners({ socket, qc, myId });

    return () => {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [accessToken, myId]);
};
