import type { Socket } from "socket.io-client";

interface Deps {
  socket: Socket;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
  hydrate: (userIds: string[]) => void;
}

export const registerPresenceListeners = ({
  socket,
  setOnline,
  setOffline,
  hydrate,
}: Deps) => {
  socket.on("friends:online", (userIds: string[]) => hydrate(userIds));
  socket.on("friend:online", ({ userId }: { userId: string }) =>
    setOnline(userId),
  );
  socket.on("friend:offline", ({ userId }: { userId: string }) =>
    setOffline(userId),
  );
};
