import { useCallback } from "react";
import { useSocketStore } from "../stores/socket-store";

export const useSocket = () => {
  const socket = useSocketStore((s) => s.socket);

  const joinPostRoom = useCallback(
    (postId: string) => socket?.emit("post:join", postId),
    [socket],
  );

  const leavePostRoom = useCallback(
    (postId: string) => socket?.emit("post:leave", postId),
    [socket],
  );

  const joinStoryRoom = useCallback(
    (storyId: string) => socket?.emit("story:join", storyId),
    [socket],
  );

  const leaveStoryRoom = useCallback(
    (storyId: string) => socket?.emit("story:leave", storyId),
    [socket],
  );

  return { joinPostRoom, leavePostRoom, joinStoryRoom, leaveStoryRoom };
};
