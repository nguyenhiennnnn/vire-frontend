// ─── Primitive Enums ──────────────────────────────────────
export type Privacy = "PUBLIC" | "FRIENDS" | "ONLY_ME";
export type FriendStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
export type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";
export type MediaType = "IMAGE" | "VIDEO";
export type NotifType =
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "POST_REACT"
  | "POST_COMMENT"
  | "COMMENT_REPLY"
  | "NEW_FOLLOWER"
  | "NEW_POST";

export type FriendshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"
  | "blocked"
  | "blocked_by";

// ─── User ─────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  email: string;
  googleId: string | null;
  avatar: string | null;
  coverPhoto: string | null;
  bio: string | null;
  isVerified: boolean;
  isActive: boolean;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export type UserBasic = Pick<User, "id" | "username" | "avatar">;

export type UserCard = Pick<
  User,
  "id" | "username" | "avatar" | "friendsCount"
>;

export interface UserSearchResult extends User {
  friendshipStatus: FriendshipStatus;
}

export interface UserProfile extends User {
  friendshipStatus: FriendshipStatus;
  isFollowing: boolean;
}

// ─── Post ─────────────────────────────────────────────────
export interface Post {
  id: string;
  userId: string;
  content: string | null;
  mediaUrls: string[];
  privacy: Privacy;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  user: UserBasic;
  _count: { reactions: number; comments: number };
  reactions: Array<{ type: ReactionType }>;
}

// ─── Comment ──────────────────────────────────────────────
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: UserBasic;
  _count?: { replies: number };
}

// ─── Reaction ─────────────────────────────────────────────
export interface Reaction {
  id: string;
  userId: string;
  postId: string;
  type: ReactionType;
  createdAt: string;
  user: UserBasic;
}

export interface ReactionSummary {
  total: number;
  byType: Record<ReactionType, number>;
  myReaction: ReactionType | null;
}

// ─── Friendship ───────────────────────────────────────────
export interface Friendship {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendStatus;
  createdAt: string;
  updatedAt: string;
  sender?: UserCard;
  receiver?: UserCard;
}

export interface FriendSuggestion {
  user: UserCard;
  mutualCount: number;
}

// ─── Notification ─────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  fromUserId: string;
  type: NotifType;
  postId: string | null;
  commentId: string | null;
  friendshipId: string | null;
  targetType: string | null;
  isRead: boolean;
  createdAt: string;
  fromUser: UserBasic;
}

// ─── Story ────────────────────────────────────────────────
export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: MediaType;
  caption: string | null;
  expiresAt: string;
  createdAt: string;
  user?: UserBasic;
  views?: Array<{ viewerId: string }>;
  isExpired?: boolean;
  isViewed?: boolean;
  _count?: { views: number };
  viewsCount: number;
}

export interface StoryGroup {
  user: UserBasic;
  stories: Story[];
  hasUnread: boolean;
}

export interface StoryViewerItem {
  user: UserBasic;
  viewedAt: string;
}

// ─── Pagination ───────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ─── API shapes ───────────────────────────────────────────
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface MessageResponse {
  message: string;
}

// ─── Auth ─────────────────────────────────────────────────
export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}
