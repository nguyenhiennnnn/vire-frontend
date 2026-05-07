import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { reactionsApi } from "../services/api-services";
import { toast } from "sonner";
import type { Post, ReactionType } from "../types";

export const useReactionMutation = (post: Post) => {
  const [showPicker, setShowPicker] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myReaction: ReactionType | null = post.reactions[0]?.type ?? null;

  const { mutate, isPending } = useMutation({
    mutationFn: (type: ReactionType) => reactionsApi.toggle(post.id, type),
    onError: () => toast.error("Không thể thực hiện cảm xúc"),
  });

  const clearLeaveTimer = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };

  const handleMouseEnter = () => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setShowPicker(true), 500);
  };

  const handleMouseLeave = () => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setShowPicker(false), 300);
  };

  const handleLikeClick = () => {
    if (isPending) return;
    setShowPicker(false);
    mutate(myReaction ?? "LIKE");
  };

  const handlePickerSelect = (type: ReactionType) => {
    if (isPending) return;
    setShowPicker(false);
    mutate(type);
  };

  return {
    myReaction,
    showPicker,
    isPending,
    handleMouseEnter,
    handleMouseLeave,
    handleLikeClick,
    handlePickerSelect,
    clearLeaveTimer,
  };
};
