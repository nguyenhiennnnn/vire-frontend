import type { Socket } from "socket.io-client";
import type { QueryClient, InfiniteData } from "@tanstack/react-query";
import type { Notification, PaginatedResponse } from "../types";
import {
  prependToInfinite,
  patchInfinitePages,
  removeFromInfinite,
} from "./utils";

interface Deps {
  socket: Socket;
  qc: QueryClient;
  setUnreadCount: (count: number) => void;
}

export const registerNotificationListeners = ({
  socket,
  qc,
  setUnreadCount,
}: Deps) => {
  socket.on(
    "notification:new",
    ({
      notification,
      unreadCount,
    }: {
      notification: Notification;
      unreadCount: number;
    }) => {
      setUnreadCount(unreadCount);
      qc.setQueriesData<InfiniteData<PaginatedResponse<Notification>>>(
        { queryKey: ["notifications"] },
        (old) => (old ? prependToInfinite(old, notification) : old),
      );
    },
  );

  socket.on(
    "notification:read",
    ({
      notificationIds,
      unreadCount,
    }: {
      notificationIds: string[];
      unreadCount: number;
    }) => {
      setUnreadCount(unreadCount);
      qc.setQueriesData<InfiniteData<PaginatedResponse<Notification>>>(
        { queryKey: ["notifications"] },
        (old) =>
          patchInfinitePages(old, (items) =>
            items.map((n) =>
              notificationIds.includes(n.id) ? { ...n, isRead: true } : n,
            ),
          ),
      );
    },
  );

  socket.on(
    "notification:read_all",
    ({ unreadCount }: { unreadCount: number }) => {
      setUnreadCount(unreadCount);
      qc.setQueriesData<InfiniteData<PaginatedResponse<Notification>>>(
        { queryKey: ["notifications"] },
        (old) =>
          patchInfinitePages(old, (items) =>
            items.map((n) => ({ ...n, isRead: true })),
          ),
      );
    },
  );

  socket.on(
    "notification:deleted",
    ({
      notificationId,
      unreadCount,
    }: {
      notificationId: string;
      unreadCount: number;
    }) => {
      setUnreadCount(unreadCount);
      qc.setQueriesData<InfiniteData<PaginatedResponse<Notification>>>(
        { queryKey: ["notifications"] },
        (old) => removeFromInfinite(old, notificationId),
      );
    },
  );
};
