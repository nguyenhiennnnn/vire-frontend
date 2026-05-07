import type { Socket } from "socket.io-client";
import type { QueryClient, InfiniteData } from "@tanstack/react-query";
import type {
  User,
  PaginatedResponse,
  Friendship,
  FriendshipStatus,
} from "../types";
import type {
  FriendAcceptedPayload,
  FriendRejectedPayload,
  FriendCancelledPayload,
  FriendRemovedPayload,
  ProfileCache,
  FriendUnblockedByPayload,
  FriendYouUnblockedPayload,
  FriendBlockedByPayload,
  FriendYouBlockedPayload,
  FriendYouCancelledPayload,
  FriendYouRejectedPayload,
  FriendRequestSentPayload,
  FriendRequestReceivedPayload,
} from "./types";
import {
  prependToInfinite,
  patchInfinitePages,
  removeFromInfinite,
} from "./utils";

interface Deps {
  socket: Socket;
  qc: QueryClient;
  myId: string;
  incrementFriendRequest: () => void;
  decrementFriendRequest: () => void;
}

const invalidateSuggestions = (qc: QueryClient) => {
  qc.invalidateQueries({ queryKey: ["friend-suggestions"] });
  qc.invalidateQueries({ queryKey: ["friend-suggestions-sidebar"] });
};

const setProfileStatus = (
  qc: QueryClient,
  userId: string,
  status: FriendshipStatus,
) =>
  qc.setQueryData<ProfileCache>(["profile", userId], (old) =>
    old ? { ...old, friendshipStatus: status } : old,
  );

const setProfileFriendsCount = (
  qc: QueryClient,
  userId: string,
  friendsCount: number,
) =>
  qc.setQueryData<ProfileCache>(["profile", userId], (old) =>
    old ? { ...old, user: { ...old.user, friendsCount } } : old,
  );

export const registerFriendListeners = ({
  socket,
  qc,
  myId,
  incrementFriendRequest,
  decrementFriendRequest,
}: Deps) => {
  socket.on(
    "friend:request_received",
    ({ friendship }: FriendRequestReceivedPayload) => {
      incrementFriendRequest();
      qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
        ["friendship-requests"],
        (old) => (old ? prependToInfinite(old, friendship) : old),
      );
      setProfileStatus(qc, friendship.senderId, "pending_received");
      invalidateSuggestions(qc);
    },
  );

  socket.on(
    "friend:request_sent",
    ({ friendship }: FriendRequestSentPayload) => {
      qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
        ["friendship-sent"],
        (old) => (old ? prependToInfinite(old, friendship) : old),
      );
      setProfileStatus(qc, friendship.receiverId, "pending_sent");
      invalidateSuggestions(qc);
    },
  );

  socket.on(
    "friend:request_accepted",
    ({ friendship, users }: FriendAcceptedPayload) => {
      // My sent request was accepted — I am the sender
      qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
        ["friendship-sent"],
        (old) => removeFromInfinite(old, friendship.id),
      );
      if (friendship.receiver) {
        qc.setQueryData<InfiniteData<PaginatedResponse<User>>>(
          ["friends", myId],
          (old) => {
            if (!old) return old;
            const alreadyIn = old.pages.some((p) =>
              p.data.some((u) => u.id === friendship.receiver.id),
            );
            return alreadyIn
              ? old
              : prependToInfinite(old, friendship.receiver as User);
          },
        );
      }
      [friendship.senderId, friendship.receiverId].forEach((uid) => {
        if (users[uid])
          setProfileFriendsCount(qc, uid, users[uid].friendsCount);
      });
      setProfileStatus(qc, friendship.receiverId, "accepted");
      invalidateSuggestions(qc);
    },
  );

  socket.on(
    "friend:you_accepted_request",
    ({ friendship, users }: FriendAcceptedPayload) => {
      // I accepted someone's request — I am the receiver
      decrementFriendRequest();
      qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
        ["friendship-requests"],
        (old) => removeFromInfinite(old, friendship.id),
      );
      if (friendship.sender) {
        qc.setQueryData<InfiniteData<PaginatedResponse<User>>>(
          ["friends", myId],
          (old) => {
            if (!old) return old;
            const alreadyIn = old.pages.some((p) =>
              p.data.some((u) => u.id === friendship.sender.id),
            );
            return alreadyIn
              ? old
              : prependToInfinite(old, friendship.sender as User);
          },
        );
      }
      [friendship.senderId, friendship.receiverId].forEach((uid) => {
        if (users[uid])
          setProfileFriendsCount(qc, uid, users[uid].friendsCount);
      });
      setProfileStatus(qc, friendship.senderId, "accepted");
      invalidateSuggestions(qc);
    },
  );

  socket.on(
    "friend:request_rejected",
    ({ friendshipId, rejectedBy }: FriendRejectedPayload) => {
      // My sent request was rejected
      qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
        ["friendship-sent"],
        (old) => removeFromInfinite(old, friendshipId),
      );
      setProfileStatus(qc, rejectedBy, "none");
      invalidateSuggestions(qc);
    },
  );

  socket.on(
    "friend:you_rejected_request",
    ({ friendshipId, requestFrom }: FriendYouRejectedPayload) => {
      // I rejected someone's request
      decrementFriendRequest();
      qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
        ["friendship-requests"],
        (old) => removeFromInfinite(old, friendshipId),
      );
      setProfileStatus(qc, requestFrom, "none");
      invalidateSuggestions(qc);
    },
  );

  socket.on(
    "friend:request_cancelled",
    ({ friendshipId, cancelledBy }: FriendCancelledPayload) => {
      // Someone cancelled their request to me
      decrementFriendRequest();
      qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
        ["friendship-requests"],
        (old) => removeFromInfinite(old, friendshipId),
      );
      setProfileStatus(qc, cancelledBy, "none");
      invalidateSuggestions(qc);
    },
  );

  socket.on(
    "friend:you_cancelled_request",
    ({ friendshipId }: FriendYouCancelledPayload) => {
      // I cancelled my sent request
      qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
        ["friendship-sent"],
        (old) => removeFromInfinite(old, friendshipId),
      );
      invalidateSuggestions(qc);
    },
  );

  socket.on("friend:you_unfriended", ({ users }: FriendRemovedPayload) => {
    const otherId = Object.keys(users).find((id) => id !== myId);
    if (otherId) {
      qc.setQueryData<InfiniteData<PaginatedResponse<User>>>(
        ["friends", myId],
        (old) =>
          patchInfinitePages(old, (items) =>
            items.filter((u) => u.id !== otherId),
          ),
      );
      setProfileStatus(qc, otherId, "none");
    }
    if (users[myId]) setProfileFriendsCount(qc, myId, users[myId].friendsCount);
    invalidateSuggestions(qc);
  });

  socket.on("friend:unfriended_by", ({ users }: FriendRemovedPayload) => {
    const otherId = Object.keys(users).find((id) => id !== myId);
    if (otherId) {
      qc.setQueryData<InfiniteData<PaginatedResponse<User>>>(
        ["friends", myId],
        (old) =>
          patchInfinitePages(old, (items) =>
            items.filter((u) => u.id !== otherId),
          ),
      );
      setProfileStatus(qc, otherId, "none");
    }
    if (users[myId]) setProfileFriendsCount(qc, myId, users[myId].friendsCount);
    invalidateSuggestions(qc);
  });

  socket.on(
    "friend:you_blocked",
    ({
      targetId,
      wasFriends,
      hadPendingFromThem,
      hadPendingToThem,
      users,
    }: FriendYouBlockedPayload) => {
      if (wasFriends) {
        qc.setQueryData<InfiniteData<PaginatedResponse<User>>>(
          ["friends", myId],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.filter((u) => u.id !== targetId),
            ),
        );
      }
      if (hadPendingFromThem) {
        decrementFriendRequest();
        qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
          ["friendship-requests"],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.filter((f) => f.sender?.id !== targetId),
            ),
        );
      }
      if (hadPendingToThem) {
        qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
          ["friendship-sent"],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.filter((f) => f.receiver?.id !== targetId),
            ),
        );
      }
      setProfileStatus(qc, targetId, "blocked");
      if (users[myId])
        setProfileFriendsCount(qc, myId, users[myId].friendsCount);
      invalidateSuggestions(qc);
    },
  );

  socket.on(
    "friend:blocked_by",
    ({
      actorId,
      wasFriends,
      iHadSentRequest,
      theyHadSentRequest,
      users,
    }: FriendBlockedByPayload) => {
      if (wasFriends) {
        qc.setQueryData<InfiniteData<PaginatedResponse<User>>>(
          ["friends", myId],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.filter((u) => u.id !== actorId),
            ),
        );
      }
      if (iHadSentRequest) {
        // I had sent actorId a request → remove from my sent list
        qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
          ["friendship-sent"],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.filter((f) => f.receiver?.id !== actorId),
            ),
        );
      }
      if (theyHadSentRequest) {
        // actorId had sent me a request → remove from my incoming
        decrementFriendRequest();
        qc.setQueryData<InfiniteData<PaginatedResponse<Friendship>>>(
          ["friendship-requests"],
          (old) =>
            patchInfinitePages(old, (items) =>
              items.filter((f) => f.sender?.id !== actorId),
            ),
        );
      }
      setProfileStatus(qc, actorId, "blocked_by");
      if (users[myId])
        setProfileFriendsCount(qc, myId, users[myId].friendsCount);
      invalidateSuggestions(qc);
    },
  );

  socket.on(
    "friend:you_unblocked",
    ({ targetId }: FriendYouUnblockedPayload) => {
      setProfileStatus(qc, targetId, "none");
      invalidateSuggestions(qc);
    },
  );

  socket.on("friend:unblocked_by", ({ actorId }: FriendUnblockedByPayload) => {
    setProfileStatus(qc, actorId, "none");
    invalidateSuggestions(qc);
  });
};
