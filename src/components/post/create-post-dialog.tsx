import { useState, useCallback, useRef, useEffect } from "react";
import {
  Globe,
  Users,
  Lock,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UserAvatar } from "../shared/user-avatar";
import { PostEditor } from "./post-editor";
import { MediaUploadZone } from "./media-upload-zone";
import { useCloudinaryUpload } from "../../hooks/use-cloudinary-upload";
import { useAuth } from "../../hooks/use-auth";
import type { Privacy } from "../../types";
import { useGenerateCaption } from "../../hooks/use-generate-caption";
import { useCreatePostMutation } from "../../hooks/use-post-mutations";

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
  open: boolean;
  onClose: () => void;
  initialMediaOpen?: boolean;
}

export const CreatePostDialog = ({
  open,
  onClose,
  initialMediaOpen,
}: Props) => {
  const { user } = useAuth();
  const upload = useCloudinaryUpload("posts");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorResetRef = useRef<(() => void) | null>(null);
  const editorSetValueRef = useRef<((html: string) => void) | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);

  const [html, setHtml] = useState("");
  const [plainText, setPlainText] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("FRIENDS");
  const [isDragging, setIsDragging] = useState(false);

  const { generate, isGenerating } = useGenerateCaption();

  useEffect(() => {
    if (open && initialMediaOpen) {
      const t = setTimeout(() => fileInputRef.current?.click(), 150);
      return () => clearTimeout(t);
    }
  }, [open, initialMediaOpen]);

  const handleClose = useCallback(() => {
    setHtml("");
    setPlainText("");
    setPrivacy("FRIENDS");
    upload.reset();
    editorResetRef.current?.();
    onClose();
  }, [upload, onClose]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      upload.addFiles(Array.from(e.dataTransfer.files));
    },
    [upload],
  );

  const createPostMutation = useCreatePostMutation({ onSuccess: handleClose });

  const isWorking = createPostMutation.isPending || upload.isUploading;
  const canSubmit =
    (plainText.trim().length > 0 || upload.hasFiles) &&
    !isWorking &&
    !upload.hasError;

  const buttonLabel = () => {
    if (upload.isUploading) {
      const done = upload.items.filter((x) => x.status === "done").length;
      return `Đang tải ${done}/${upload.items.length}...`;
    }
    if (createPostMutation.isPending) return "Đang đăng...";
    return "Đăng";
  };

  const handleGenerateCaption = useCallback(async () => {
    const doneUrls = upload.items
      .filter((x) => x.status === "done" && x.url)
      .map((x) => x.url!);

    let urls = doneUrls;
    if (upload.items.some((x) => x.status === "idle")) {
      urls = await upload.uploadAll();
    }

    if (!urls.length) return;
    const results = await generate(urls);
    if (results?.length) setCaptions(results);
  }, [upload, generate]);

  const handleSubmit = async () => {
    let mediaUrls: string[] = [];
    if (upload.hasFiles) mediaUrls = await upload.uploadAll();
    createPostMutation.mutate({ html, plainText, privacy, mediaUrls });
  };

  const handleSelectCaption = useCallback((caption: string) => {
    editorSetValueRef.current?.(`<p>${caption}</p>`);
    setCaptions([]);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-145 max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-center text-base font-semibold">
            Tạo bài viết
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {user && (
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="md" />
              <div>
                <p className="font-semibold text-sm">{user.username}</p>
                <Select
                  value={privacy}
                  onValueChange={(v) => setPrivacy(v as Privacy)}
                >
                  <SelectTrigger className="h-7 text-xs px-2 border rounded-full w-auto gap-1 mt-0.5">
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
              </div>
            </div>
          )}

          <PostEditor
            placeholder={
              user ? `Bạn đang nghĩ gì, ${user.username}?` : "Bạn đang nghĩ gì?"
            }
            onChange={(h, t) => {
              setHtml(h);
              setPlainText(t);
            }}
            onReset={(fn) => {
              editorResetRef.current = fn;
            }}
            onSetValue={(fn) => {
              editorSetValueRef.current = fn;
            }}
            autoFocus={open}
          />

          {captions.length > 0 && (
            <div className="rounded-xl border bg-muted/40 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Sparkles size={12} className="text-purple-500" />
                  Chọn caption
                </span>
                <button
                  type="button"
                  onClick={() => setCaptions([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Đóng
                </button>
              </div>
              <div className="divide-y">
                {captions.map((caption, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectCaption(caption)}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors leading-relaxed"
                  >
                    <span className="text-xs font-medium text-purple-500 mr-2">
                      #{i + 1}
                    </span>
                    {caption}
                  </button>
                ))}
              </div>
            </div>
          )}

          <MediaUploadZone
            items={upload.items}
            onAddFiles={upload.addFiles}
            onRemove={upload.removeFile}
            maxFiles={upload.MAX_FILES}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          {upload.hasError && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/8 rounded-xl px-3 py-2.5 border border-destructive/15">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>
                Một số file upload thất bại. Xoá và thử lại hoặc chọn file khác.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t bg-card">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.items.length >= upload.MAX_FILES}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ImageIcon size={17} className="text-primary" />
            <span>Ảnh / Video</span>
            {upload.items.length > 0 && (
              <span className="text-xs text-primary font-medium">
                ({upload.items.length}/{upload.MAX_FILES})
              </span>
            )}
          </button>

          {upload.hasFiles && (
            <button
              type="button"
              onClick={handleGenerateCaption}
              disabled={isGenerating || isWorking}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles size={15} className="text-purple-500" />
              <span>
                {isGenerating ? "Đang tạo caption..." : "Tạo caption AI"}
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) upload.addFiles(Array.from(e.target.files));
              e.target.value = "";
            }}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isWorking}
            >
              Huỷ
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={!canSubmit}
              className="min-w-18"
            >
              {buttonLabel()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
