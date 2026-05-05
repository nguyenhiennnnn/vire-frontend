import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useSocketStore } from "../stores/socket-store";
import { postsApi } from "../services/api-services";
import { PostCardSkeleton } from "../components/shared/skeleton-card";
import { PostCard } from "../components/post/post-card";
import { CommentSection } from "../components/comment/comment-section";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const commentInputRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocketStore();

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
    if (!socket || !id) return;
    socket.emit("join_post", id);
    return () => {
      socket.emit("leave_post", id);
    };
  }, [socket, id]);

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
