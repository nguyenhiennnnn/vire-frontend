import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { useNotificationStore } from "../stores/notification-store";
import { useSocketStore } from "../stores/socket-store";
import { bootstrapApi } from "../services/api-services";

export const useBootstrap = () => {
  const [isReady, setIsReady] = useState(false);
  const { setAuth } = useAuthStore();
  const { setUnreadCount, setFriendRequestCount } = useNotificationStore();
  const { connect } = useSocketStore();

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await bootstrapApi.refresh();
        const user = await bootstrapApi.getMe(token);

        setAuth(user, token);
        connect(token);

        try {
          const [unreadCount, friendRequestCount] = await Promise.all([
            bootstrapApi.getUnreadCount(token),
            bootstrapApi.getFriendRequestCount(token),
          ]);
          setUnreadCount(unreadCount);
          setFriendRequestCount(friendRequestCount);
        } catch {
          // Non-critical — badges just start at 0
        }
      } catch {
        // No valid session — ProtectedRoute will redirect to /login
      } finally {
        setIsReady(true);
      }
    };

    restore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { isReady };
};
