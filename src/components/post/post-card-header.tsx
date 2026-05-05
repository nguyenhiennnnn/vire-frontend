import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Pencil,
  Trash2,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { UserAvatar } from "../shared/user-avatar";
import { fromNow } from "../../lib/utils";
import { useAuth } from "../../hooks/use-auth";
import type { Post, Privacy } from "../../types";
import { useDeletePostMutation } from "../../hooks/use-post-mutations";

const PRIVACY_ICON: Record<Privacy, React.ReactNode> = {
  PUBLIC: <Globe size={11} />,
  FRIENDS: <Users size={11} />,
  ONLY_ME: <Lock size={11} />,
};

interface Props {
  post: Post;
  onDelete?: () => void;
  onEdit?: () => void;
  onHide?: () => void;
}

export const PostCardHeader = ({ post, onDelete, onEdit, onHide }: Props) => {
  const { user } = useAuth();
  const isOwn = user?.id === post.userId;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deletePostMutation = useDeletePostMutation({
    postId: post.id,
    userId: post.userId,
    onSuccess: onDelete,
  });

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Link to={`/profile/${post.user.id}`}>
            <UserAvatar user={post.user} size="md" />
          </Link>
          <div>
            <Link
              to={`/profile/${post.user.id}`}
              className="font-semibold text-sm hover:underline leading-tight block"
            >
              {post.user.username}
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <span>{fromNow(post.createdAt)}</span>
              <span>·</span>
              <span className="flex items-center">
                {PRIVACY_ICON[post.privacy]}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground -mr-1">
              <MoreHorizontal size={17} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {isOwn ? (
              <>
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil size={14} className="mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={14} className="mr-2" />
                  Xoá bài viết
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={onHide}>
                <EyeOff size={14} className="mr-2" />
                Ẩn bài viết
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bài viết và tất cả bình luận sẽ
              bị xoá vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                setDeleteOpen(false);
                deletePostMutation.mutate();
              }}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Đang xoá..." : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
