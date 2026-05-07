import type {
  ReactionType,
  FriendshipStatus,
  Friendship,
  Comment,
} from "../types";

export interface ReactionUpdatedPayload {
  postId: string;
  userId: string;
  reactionType: ReactionType | null;
  likesCount: number;
  breakdown: Record<ReactionType, number>;
  total: number;
}

export interface CommentNewPayload {
  postId: string;
  comment: Comment;
  parentId?: string;
  commentsCount: number;
}

export interface CommentUpdatedPayload {
  postId: string;
  commentId: string;
  parentId: string | null;
  content: string;
  updatedAt: string;
}

export interface CommentDeletedPayload {
  postId: string;
  commentId: string;
  parentId: string | null;
  decrementBy: number;
  commentsCount: number;
}

export interface PostUpdatedPayload {
  postId: string;
  changes: { content?: string; privacy?: string };
  updatedAt: string;
  privacyChanged: boolean;
}

export interface FriendRequestReceivedPayload {
  friendship: Friendship & {
    sender: {
      id: string;
      username: string;
      avatar: string | null;
      friendsCount: number;
    };
    receiver: { id: string; username: string; avatar: string | null };
  };
  sender: {
    id: string;
    username: string;
    avatar: string | null;
    friendsCount: number;
  };
}

export interface FriendRequestSentPayload {
  friendship: Friendship & {
    receiver: { id: string; username: string; avatar: string | null };
  };
}

export interface FriendAcceptedPayload {
  friendship: Friendship & {
    sender: {
      id: string;
      username: string;
      avatar: string | null;
      friendsCount: number;
    };
    receiver: {
      id: string;
      username: string;
      avatar: string | null;
      friendsCount: number;
    };
  };
  users: Record<
    string,
    {
      id: string;
      username: string;
      avatar: string | null;
      friendsCount: number;
    }
  >;
}

export interface FriendRejectedPayload {
  friendshipId: string;
  rejectedBy: string;
}

export interface FriendYouRejectedPayload {
  friendshipId: string;
  requestFrom: string;
}

export interface FriendCancelledPayload {
  friendshipId: string;
  cancelledBy: string;
}

export interface FriendYouCancelledPayload {
  friendshipId: string;
  cancelledFor: string;
}

export interface FriendRemovedPayload {
  friendshipId: string;
  users: Record<string, { id: string; friendsCount: number }>;
}

export interface FriendYouBlockedPayload {
  targetId: string;
  wasFriends: boolean;
  hadPendingFromThem: boolean;
  hadPendingToThem: boolean;
  friendshipId: string;
  users: Record<string, { id: string; friendsCount: number }>;
}

export interface FriendBlockedByPayload {
  actorId: string;
  wasFriends: boolean;
  iHadSentRequest: boolean;
  theyHadSentRequest: boolean;
  friendshipId: string;
  users: Record<string, { id: string; friendsCount: number }>;
}

export interface FriendYouUnblockedPayload {
  targetId: string;
  friendshipId: string;
}

export interface FriendUnblockedByPayload {
  actorId: string;
  friendshipId: string;
}

export interface ProfileCache {
  user: {
    id: string;
    friendsCount: number;
    followersCount: number;
    followingCount: number;
    [key: string]: unknown;
  };
  friendshipStatus: FriendshipStatus;
  isFollowing: boolean;
}
