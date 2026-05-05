import { useSocketConnection } from "./use-socket-connection";
import { useSocketNotificationEvents } from "./use-socket-notification-events";
import { useSocketPostEvents } from "./use-socket-post-events";
import { useSocketStoryEvents } from "./use-socket-story-events";
import { useSocketFriendEvents } from "./use-socket-friend-events";
import { useSocketFollowEvents } from "./use-socket-follow-events";
import { useSocketPresenceEvents } from "./use-socket-presence-events";

export const useSocket = () => {
  useSocketConnection();
  useSocketNotificationEvents();
  useSocketPostEvents();
  useSocketStoryEvents();
  useSocketFriendEvents();
  useSocketFollowEvents();
  useSocketPresenceEvents();
};
