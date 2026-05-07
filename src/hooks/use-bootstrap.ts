import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../stores/auth-store";
import { usersApi, bootstrapApi } from "../services/api-services";
import { useNotificationStore } from "../stores/notification-store";
import type { RefreshResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL as string;

export function useBootstrap() {
  const hasToken = useAuthStore.getState().accessToken;
  const [isReady, setIsReady] = useState(!!hasToken);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const existingToken = useAuthStore.getState().accessToken;

    if (existingToken) {
      // Token đã có sẵn → fetch counts luôn
      const { setUnreadCount, setFriendRequestCount } =
        useNotificationStore.getState();

      Promise.all([
        bootstrapApi.getUnreadCount(),
        bootstrapApi.getFriendRequestCount(),
      ]).then(([unread, friendReq]) => {
        setUnreadCount(unread);
        setFriendRequestCount(friendReq);
      });

      return;
    }

    axios
      .post<RefreshResponse>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .then(async ({ data }) => {
        const newToken = data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);

        const [user, unread, friendReq] = await Promise.all([
          usersApi.getMe(),
          bootstrapApi.getUnreadCount(),
          bootstrapApi.getFriendRequestCount(),
        ]);

        useAuthStore.getState().setAuth(user, newToken);

        const { setUnreadCount, setFriendRequestCount } =
          useNotificationStore.getState();
        setUnreadCount(unread);
        setFriendRequestCount(friendReq);
      })
      .catch(() => {
        useAuthStore.getState().logout();
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  return { isReady };
}
