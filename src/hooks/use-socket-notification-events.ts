import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useSocketStore } from "../stores/socket-store";
import { useNotificationStore } from "../stores/notification-store";
import type { Notification } from "../types";

const getNotifDesc = (type: string, username: string): string => {
  const map: Record<string, string> = {
    FRIEND_REQUEST: `${username} đã gửi lời mời kết bạn`,
    FRIEND_ACCEPTED: `${username} đã chấp nhận lời mời kết bạn`,
    POST_REACT: `${username} đã react bài viết của bạn`,
    POST_COMMENT: `${username} đã bình luận bài viết của bạn`,
    COMMENT_REPLY: `${username} đã trả lời bình luận của bạn`,
    NEW_FOLLOWER: `${username} đã theo dõi bạn`,
    NEW_POST: `${username} vừa đăng bài viết mới`,
  };
  return map[type] ?? "Có hoạt động mới";
};

/** Lắng nghe sự kiện `new_notification` và hiển thị toast. */
export const useSocketNotificationEvents = () => {
  const { socket } = useSocketStore();
  const { addNotification, incrementUnread } = useNotificationStore();
  const location = useLocation();

  useEffect(() => {
    if (!socket) return;

    const onNewNotification = (notif: Notification) => {
      addNotification(notif);
      incrementUnread();
      if (location.pathname !== "/notifications" && notif.type !== "NEW_POST") {
        toast(notif.fromUser.username, {
          description: getNotifDesc(notif.type, notif.fromUser.username),
        });
      }
    };

    socket.on("new_notification", onNewNotification);
    return () => {
      socket.off("new_notification", onNewNotification);
    };
  }, [socket, location.pathname]); // eslint-disable-line
};
