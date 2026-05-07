import { useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { postsApi } from "../services/api-services";
import { PostCardSkeleton } from "../components/shared/skeleton-card";
import { PostCard } from "../components/post/post-card";
import { CommentSection } from "../components/comment/comment-section";
import { useSocket } from "../hooks/use-socket";
import { useSocketStore } from "../stores/socket-store";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { joinPostRoom, leavePostRoom } = useSocket();
  const { socket } = useSocketStore();
  const commentInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    joinPostRoom(id);
    return () => {
      leavePostRoom(id);
    };
  }, [id, joinPostRoom, leavePostRoom, socket?.connected]);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (!isLoading && !post && !error) navigate("/feed", { replace: true });
  }, [post, isLoading, error]);

  const scrollToComments = () => {
    commentInputRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <PostCardSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-3">
        <p className="text-muted-foreground">
          Bài viết không tồn tại hoặc bạn không có quyền xem.
        </p>
        <Link to="/feed" className="text-primary hover:underline text-sm">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          to="/feed"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} /> Trang chủ
        </Link>
        <span>{">"}</span>
        <span className="text-foreground">Bài viết</span>
      </div>

      <PostCard post={post} variant="full" onCommentClick={scrollToComments} />

      <div
        ref={commentInputRef}
        className="bg-card border rounded-xl overflow-hidden"
      >
        <CommentSection postId={post.id} commentsCount={post.commentsCount} />
      </div>
    </div>
  );
}
