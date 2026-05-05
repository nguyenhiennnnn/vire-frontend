import api from "./api";
import type {
  User,
  UserProfile,
  UserSearchResult,
  Post,
  Comment,
  Reaction,
  ReactionSummary,
  Friendship,
  FriendSuggestion,
  Notification,
  Story,
  StoryGroup,
  StoryViewerItem,
  PaginatedResponse,
  LoginResponse,
  MessageResponse,
  Privacy,
  ReactionType,
  RefreshResponse,
} from "../types";

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<MessageResponse>("/auth/register", data).then((r) => r.data),

  verifyEmail: (token: string) =>
    api
      .get<MessageResponse>(`/auth/verify-email?token=${token}`)
      .then((r) => r.data),

  resendVerify: (email: string) =>
    api
      .post<MessageResponse>("/auth/resend-verify", { email })
      .then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", data).then((r) => r.data),

  logout: () => api.post<MessageResponse>("/auth/logout").then((r) => r.data),

  refresh: () =>
    api.post<{ accessToken: string }>("/auth/refresh").then((r) => r.data),

  forgotPassword: (email: string) =>
    api
      .post<MessageResponse>("/auth/forgot-password", { email })
      .then((r) => r.data),

  verifyOtp: (data: { email: string; code: string }) =>
    api
      .post<{ resetToken: string }>("/auth/verify-otp", data)
      .then((r) => r.data),

  resetPassword: (data: { resetToken: string; newPassword: string }) =>
    api.post<MessageResponse>("/auth/reset-password", data).then((r) => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<MessageResponse>("/auth/change-password", data).then((r) => r.data),
};

// ─── Users ────────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get<{ user: User }>("/users/me").then((r) => r.data.user),

  updateMe: (data: { username?: string; bio?: string }) =>
    api.put<{ user: User }>("/users/me", data).then((r) => r.data.user),

  updateAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api
      .put<{ avatarUrl: string }>("/users/me/avatar", form)
      .then((r) => r.data);
  },

  updateCover: (file: File) => {
    const form = new FormData();
    form.append("cover", file);
    return api
      .put<{ coverUrl: string }>("/users/me/cover", form)
      .then((r) => r.data);
  },

  deactivate: () =>
    api.put<MessageResponse>("/users/me/deactivate").then((r) => r.data),

  deleteAccount: () =>
    api.delete<MessageResponse>("/users/me").then((r) => r.data),

  getProfile: (id: string) =>
    api
      .get<{
        user: UserProfile;
        friendshipStatus: string;
        isFollowing: boolean;
      }>(`/users/${id}`)
      .then((r) => r.data),

  getByUsername: (username: string) =>
    api
      .get<{
        user: UserProfile;
        friendshipStatus: string;
        isFollowing: boolean;
      }>(`/users/by-username/${username}`)
      .then((r) => r.data),

  search: (q: string) =>
    api
      .get<{
        users: UserSearchResult[];
      }>(`/users/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.data.users),
};

// ─── Posts ────────────────────────────────────────────────
export const postsApi = {
  create: (data: {
    content?: string;
    mediaUrls?: string[];
    privacy: Privacy;
  }) => api.post<{ post: Post }>("/posts", data).then((r) => r.data.post),

  getFeed: (cursor?: string, limit = 10) =>
    api
      .get<
        PaginatedResponse<Post>
      >("/posts/feed", { params: { cursor, limit } })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<{ post: Post }>(`/posts/${id}`).then((r) => r.data.post),

  update: (id: string, data: { content?: string; privacy?: Privacy }) =>
    api.put<{ post: Post }>(`/posts/${id}`, data).then((r) => r.data.post),

  delete: (id: string) =>
    api.delete<MessageResponse>(`/posts/${id}`).then((r) => r.data),

  getUserPosts: (userId: string, cursor?: string, limit = 10) =>
    api
      .get<
        PaginatedResponse<Post>
      >(`/users/${userId}/posts`, { params: { cursor, limit } })
      .then((r) => r.data),
};

// ─── Comments ─────────────────────────────────────────────
export const commentsApi = {
  create: (postId: string, content: string) =>
    api
      .post<{ comment: Comment }>(`/posts/${postId}/comments`, { content })
      .then((r) => r.data.comment),

  createReply: (commentId: string, content: string) =>
    api
      .post<{ comment: Comment }>(`/comments/${commentId}/replies`, { content })
      .then((r) => r.data.comment),

  getByPost: (postId: string, cursor?: string, limit = 10) =>
    api
      .get<
        PaginatedResponse<Comment>
      >(`/posts/${postId}/comments`, { params: { cursor, limit } })
      .then((r) => r.data),

  getReplies: (commentId: string) =>
    api
      .get<{ replies: Comment[] }>(`/comments/${commentId}/replies`)
      .then((r) => r.data.replies),

  update: (id: string, content: string) =>
    api
      .put<{ comment: Comment }>(`/comments/${id}`, { content })
      .then((r) => r.data.comment),

  delete: (id: string) =>
    api.delete<MessageResponse>(`/comments/${id}`).then((r) => r.data),
};

// ─── Reactions ────────────────────────────────────────────
export const reactionsApi = {
  toggle: (postId: string, type: ReactionType) =>
    api
      .post<{
        action: "created" | "updated" | "deleted";
        reaction: Reaction | null;
        post: { likesCount: number };
      }>(`/posts/${postId}/reactions`, { type })
      .then((r) => r.data),

  getByPost: (
    postId: string,
    cursor?: string,
    limit = 20,
    type?: ReactionType,
  ) =>
    api
      .get<PaginatedResponse<Reaction>>(`/posts/${postId}/reactions`, {
        params: { cursor, limit, type },
      })
      .then((r) => r.data),

  getSummary: (postId: string) =>
    api
      .get<ReactionSummary>(`/posts/${postId}/reactions/summary`)
      .then((r) => r.data),

  getMyReaction: (postId: string) =>
    api
      .get<{ myReaction: ReactionType | null }>(`/posts/${postId}/reactions/me`)
      .then((r) => r.data),
};

// ─── Friendships ──────────────────────────────────────────
export const friendshipsApi = {
  sendRequest: (userId: string) =>
    api
      .post<{ friendship: Friendship }>(`/friendships/request/${userId}`)
      .then((r) => r.data),

  accept: (userId: string) =>
    api
      .put<{ friendship: Friendship }>(`/friendships/accept/${userId}`)
      .then((r) => r.data),

  reject: (userId: string) =>
    api
      .put<MessageResponse>(`/friendships/reject/${userId}`)
      .then((r) => r.data),

  cancel: (userId: string) =>
    api
      .delete<MessageResponse>(`/friendships/cancel/${userId}`)
      .then((r) => r.data),

  unfriend: (userId: string) =>
    api
      .delete<MessageResponse>(`/friendships/unfriend/${userId}`)
      .then((r) => r.data),

  block: (userId: string) =>
    api
      .put<MessageResponse>(`/friendships/block/${userId}`)
      .then((r) => r.data),

  unblock: (userId: string) =>
    api
      .put<MessageResponse>(`/friendships/unblock/${userId}`)
      .then((r) => r.data),

  getRequests: (cursor?: string, limit = 10) =>
    api
      .get<
        PaginatedResponse<Friendship>
      >("/friendships/requests", { params: { cursor, limit } })
      .then((r) => r.data),

  getSent: (cursor?: string, limit = 10) =>
    api
      .get<
        PaginatedResponse<Friendship>
      >("/friendships/sent", { params: { cursor, limit } })
      .then((r) => r.data),

  getFriends: (userId?: string, cursor?: string, limit = 20) =>
    api
      .get<
        PaginatedResponse<User>
      >("/friendships/friends", { params: { userId, cursor, limit } })
      .then((r) => r.data),

  getStatus: (userId: string) =>
    api
      .get<{
        friendshipStatus: string;
        isFollowing: boolean;
      }>(`/friendships/status/${userId}`)
      .then((r) => r.data),

  getSuggestions: (limit = 10) =>
    api
      .get<{
        suggestions: FriendSuggestion[];
      }>("/friendships/suggestions", { params: { limit } })
      .then((r) => r.data.suggestions),
};

// ─── Followers ────────────────────────────────────────────
export const followersApi = {
  follow: (userId: string) =>
    api
      .post<MessageResponse>(`/followers/follow/${userId}`)
      .then((r) => r.data),

  unfollow: (userId: string) =>
    api
      .delete<MessageResponse>(`/followers/unfollow/${userId}`)
      .then((r) => r.data),

  getFollowers: (userId: string, cursor?: string, limit = 20) =>
    api
      .get<
        PaginatedResponse<User>
      >(`/users/${userId}/followers`, { params: { cursor, limit } })
      .then((r) => r.data),

  getFollowing: (userId: string, cursor?: string, limit = 20) =>
    api
      .get<
        PaginatedResponse<User>
      >(`/users/${userId}/following`, { params: { cursor, limit } })
      .then((r) => r.data),

  getStatus: (userId: string) =>
    api
      .get<{ isFollowing: boolean }>(`/followers/status/${userId}`)
      .then((r) => r.data),
};

// ─── Notifications ────────────────────────────────────────
export const notificationsApi = {
  getAll: (cursor?: string, limit = 20, unread?: boolean) =>
    api
      .get<PaginatedResponse<Notification>>("/notifications", {
        params: { cursor, limit, ...(unread !== undefined ? { unread } : {}) },
      })
      .then((r) => r.data),

  getUnreadCount: () =>
    api
      .get<{ count: number }>("/notifications/unread-count")
      .then((r) => r.data.count),

  markRead: (id: string) =>
    api
      .put<{ notification: Notification }>(`/notifications/${id}/read`)
      .then((r) => r.data),

  markAllRead: () =>
    api
      .put<{ updatedCount: number }>("/notifications/read-all")
      .then((r) => r.data),

  delete: (id: string) =>
    api.delete<MessageResponse>(`/notifications/${id}`).then((r) => r.data),
};

// ─── Stories ──────────────────────────────────────────────
export const storiesApi = {
  create: (file: File, caption?: string) => {
    const form = new FormData();
    form.append("media", file);
    if (caption) form.append("caption", caption);
    return api
      .post<{ story: Story }>("/stories", form)
      .then((r) => r.data.story);
  },

  getFeed: () =>
    api
      .get<{ storyGroups: StoryGroup[] }>("/stories/feed")
      .then((r) => r.data.storyGroups),

  getMine: (cursor?: string, limit = 20) =>
    api
      .get<
        PaginatedResponse<Story>
      >("/stories/me", { params: { cursor, limit } })
      .then((r) => r.data),

  getActive: (userId: string) =>
    api
      .get<{ stories: Story[] }>(`/users/${userId}/stories/active`)
      .then((r) => r.data.stories),

  recordView: (storyId: string) =>
    api.post<MessageResponse>(`/stories/${storyId}/view`).then((r) => r.data),

  getViewers: (storyId: string) =>
    api
      .get<{
        viewers: StoryViewerItem[];
        totalViews: number;
      }>(`/stories/${storyId}/viewers`)
      .then((r) => r.data),

  delete: (id: string) =>
    api.delete<MessageResponse>(`/stories/${id}`).then((r) => r.data),
};

// ─── Bootstrap ────────────────────────────────────────────
export const bootstrapApi = {
  refresh: () =>
    api
      .post<RefreshResponse>(`/auth/refresh`, {}, { withCredentials: true })
      .then((r) => r.data.accessToken),

  getMe: (token: string) =>
    api
      .get<{ user: User }>(`/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((r) => r.data.user),

  getUnreadCount: (token: string) =>
    api
      .get<{ count: number }>(`/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((r) => r.data.count),

  getFriendRequestCount: (token: string) =>
    api
      .get<{ count: number }>(`/friendships/requests/count`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((r) => r.data.count),
};

// ─── AI ───────────────────────────────────────────────────
export const aiApi = {
  generateCaption: (imageUrls: string[], language: "vi" | "en" = "vi") =>
    api
      .post<{ captions: string[] }>("/ai/caption", { imageUrls, language })
      .then((r) => r.data.captions),
};
