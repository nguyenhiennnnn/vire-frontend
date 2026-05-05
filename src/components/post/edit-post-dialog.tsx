import { useState, useEffect, useRef } from "react";
import { Globe, Users, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PostEditor } from "./post-editor";
import type { Post, Privacy } from "../../types";
import { cn, isVideo } from "../../lib/utils";
import { VideoPlayer } from "../shared/video-player";
import { useUpdatePostMutation } from "../../hooks/use-post-mutations";

const PRIVACY_OPTIONS: {
  value: Privacy;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "PUBLIC", label: "Công khai", icon: <Globe size={13} /> },
  { value: "FRIENDS", label: "Bạn bè", icon: <Users size={13} /> },
  { value: "ONLY_ME", label: "Chỉ mình tôi", icon: <Lock size={13} /> },
];

interface Props {
  post: Post;
  open: boolean;
  onClose: () => void;
}

export const EditPostDialog = ({ post, open, onClose }: Props) => {
  const [html, setHtml] = useState(post.content ?? "");
  const [plainText, setPlainText] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>(post.privacy);
  const [contentChanged, setContentChanged] = useState(false);

  const originalHtml = useRef(post.content ?? "");

  useEffect(() => {
    setContentChanged(html.trim() !== originalHtml.current.trim());
  }, [html]);

  const isDirty = contentChanged || privacy !== post.privacy;

  const handleClose = () => {
    setHtml(post.content ?? "");
    setPrivacy(post.privacy);
    onClose();
  };

  const updatePostMutation = useUpdatePostMutation({
    post,
    onSuccess: handleClose,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        key={`${open}-${post.id}`}
        className="sm:max-w-135 max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <Select
            value={privacy}
            onValueChange={(v) => setPrivacy(v as Privacy)}
          >
            <SelectTrigger className="h-7 w-auto text-xs gap-1.5 px-2.5 rounded-full border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIVACY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  <span className="flex items-center gap-1.5">
                    {o.icon}
                    {o.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {open && (
            <PostEditor
              key={post.id}
              initialValue={post.content ?? ""}
              placeholder="Nội dung bài viết..."
              onChange={(h, t) => {
                setHtml(h);
                setPlainText(t);
              }}
              autoFocus
            />
          )}

          {post.mediaUrls.length > 0 && (
            <div className="rounded-xl overflow-hidden bg-muted border">
              <div
                className={cn(
                  "grid gap-1.5",
                  post.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2",
                )}
              >
                {post.mediaUrls.map((url, i) => (
                  <div key={url} className="overflow-hidden bg-muted">
                    {isVideo(url) ? (
                      <VideoPlayer src={url} />
                    ) : (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-full h-18 object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center py-2">
                Không thể thay đổi ảnh/video khi chỉnh sửa
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-5 py-3 border-t bg-card">
          <Button variant="ghost" onClick={handleClose}>
            Huỷ
          </Button>
          <Button
            onClick={() =>
              updatePostMutation.mutate({ html, plainText, privacy })
            }
            disabled={!isDirty || updatePostMutation.isPending}
          >
            {updatePostMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
