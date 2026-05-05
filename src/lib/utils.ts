import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NotifType, Privacy, ReactionType } from "../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date / time ─────────────────────────────────────────
/** "5 phút trước", "2 giờ trước", ... */
export const fromNow = (date: string | Date): string => dayjs(date).fromNow();

/** Format full: "12:30 · 15/06/2025" */
export const formatDateTime = (date: string | Date): string =>
  dayjs(date).format("HH:mm · DD/MM/YYYY");

/** Check if a story is expired */
export const isExpired = (expiresAt: string): boolean =>
  new Date(expiresAt) < new Date();

export const getNameShort = (name: string) => name.slice(0, 2).toUpperCase();

export const isVideo = (url: string): boolean => {
  return url.includes("/video/upload/");
};

// ─── Privacy helpers ──────────────────────────────────────
export const PRIVACY_LABEL: Record<Privacy, string> = {
  PUBLIC: "Công khai",
  FRIENDS: "Bạn bè",
  ONLY_ME: "Chỉ mình tôi",
};

export const PRIVACY_ICON: Record<Privacy, string> = {
  PUBLIC: "globe",
  FRIENDS: "users",
  ONLY_ME: "lock",
};

// ─── Reaction helpers ─────────────────────────────────────
export const REACTION_EMOJI: Record<ReactionType, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  HAHA: "😂",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",
};

export const REACTION_LABEL: Record<ReactionType, string> = {
  LIKE: "Thích",
  LOVE: "Yêu thích",
  HAHA: "Haha",
  WOW: "Wow",
  SAD: "Buồn",
  ANGRY: "Phẫn nộ",
};

export const REACTION_COLOR: Record<ReactionType, string> = {
  LIKE: "text-blue-500",
  LOVE: "text-red-500",
  HAHA: "text-yellow-500",
  WOW: "text-yellow-400",
  SAD: "text-blue-400",
  ANGRY: "text-orange-500",
};

// ─── Notification helpers ─────────────────────────────────
export const getNotifText = (type: NotifType, fromUsername: string): string => {
  const map: Record<NotifType, string> = {
    FRIEND_REQUEST: `${fromUsername} đã gửi lời mời kết bạn cho bạn`,
    FRIEND_ACCEPTED: `${fromUsername} đã chấp nhận lời mời kết bạn`,
    POST_REACT: `${fromUsername} đã react bài viết của bạn`,
    POST_COMMENT: `${fromUsername} đã bình luận bài viết của bạn`,
    COMMENT_REPLY: `${fromUsername} đã trả lời bình luận của bạn`,
    NEW_FOLLOWER: `${fromUsername} đã theo dõi bạn`,
    NEW_POST: `${fromUsername} vừa đăng bài viết mới`,
  };
  return map[type];
};

export const NOTIF_ICON: Record<NotifType, string> = {
  FRIEND_REQUEST: "user-plus",
  FRIEND_ACCEPTED: "user-check",
  POST_REACT: "heart",
  POST_COMMENT: "message-circle",
  COMMENT_REPLY: "message-square",
  NEW_FOLLOWER: "user-plus",
  NEW_POST: "plus-circle",
};

export const truncate = (str: string, n: number): string =>
  str.length > n ? str.slice(0, n) + "…" : str;

/** Extract Cloudinary publicId from URL */
export const extractPublicId = (url: string): string => {
  const parts = url.split("/upload/");
  if (parts.length < 2) return "";
  const withoutVersion = parts[1].replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
};

// ─── Password strength ────────────────────────────────────
export type PasswordStrength = "weak" | "medium" | "strong";

export const getPasswordStrength = (password: string): PasswordStrength => {
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isLong = password.length >= 12;

  const score = [hasUpper, hasNumber, hasSpecial, isLong].filter(
    Boolean,
  ).length;
  if (score <= 1) return "weak";
  if (score <= 2) return "medium";
  return "strong";
};

export const PASSWORD_STRENGTH_COLOR: Record<PasswordStrength, string> = {
  weak: "bg-red-500",
  medium: "bg-yellow-400",
  strong: "bg-green-500",
};

export const PASSWORD_STRENGTH_LABEL: Record<PasswordStrength, string> = {
  weak: "Yếu",
  medium: "Trung bình",
  strong: "Mạnh",
};

// ─── URL helpers ──────────────────────────────────────────
export const getProfileUrl = (id: string) => `/profile/${id}`;
export const getPostUrl = (postId: string) => `/posts/${postId}`;

/** Navigate target based on notification type + specific FK fields */
export const getNotifTarget = (notif: {
  type: NotifType;
  postId: string | null;
  commentId: string | null;
  friendshipId: string | null;
  fromUser: { id: string };
}): string => {
  if (
    notif.type === "POST_REACT" ||
    notif.type === "POST_COMMENT" ||
    notif.type === "NEW_POST" ||
    notif.type === "COMMENT_REPLY"
  ) {
    return getPostUrl(notif.postId ?? "");
  }

  return getProfileUrl(notif.fromUser.id);
};

// ─── Array utils ──────────────────────────────────────────
/** Remove duplicates by a key */
export const uniqueBy = <T>(arr: T[], key: keyof T): T[] => {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// ─── File utils ───────────────────────────────────────────
export const FILE_SIZE_LIMIT = {
  avatar: 5 * 1024 * 1024, // 5 MB
  cover: 10 * 1024 * 1024, // 10 MB
  storyImage: 10 * 1024 * 1024, // 10 MB
  storyVideo: 50 * 1024 * 1024, // 50 MB
  postMedia: 50 * 1024 * 1024, // 50 MB
} as const;

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const isImageFile = (file: File): boolean =>
  file.type.startsWith("image/");

export const isVideoFile = (file: File): boolean =>
  file.type.startsWith("video/");
