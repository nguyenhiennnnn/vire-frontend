import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storiesApi } from "../../services/api-services";
import { UserAvatar } from "../shared/user-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { UserListItemSkeleton } from "../shared/skeleton-card";
import { fromNow } from "../../lib/utils";

interface Props {
  storyId: string;
  open: boolean;
  onClose: () => void;
}

export const StoryViewersDialog = ({ storyId, open, onClose }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["story-viewers", storyId],
    queryFn: () => storiesApi.getViewers(storyId),
    enabled: open && !!storyId,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Eye size={16} />
            Lượt xem
            {data && (
              <span className="text-muted-foreground font-normal text-sm">
                ({data.totalViews})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-80 py-2">
          {isLoading && <UserListItemSkeleton />}

          {!isLoading && data?.viewers.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <Eye size={32} className="opacity-30" />
              <p className="text-sm">Chưa có ai xem story này</p>
            </div>
          )}

          {data?.viewers.map(({ user, viewedAt }) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
            >
              <UserAvatar user={user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  {fromNow(viewedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
