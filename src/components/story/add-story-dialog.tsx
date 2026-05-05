import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useCreateStoryMutation } from "../../hooks/use-story-mutations";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AddStoryDialog = ({ open, onClose }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
    onClose();
  };

  const createStoryMutation = useCreateStoryMutation({
    onSuccess: handleClose,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>Tạo story</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-64 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click để chọn ảnh hoặc video
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* 9:16 preview */}
            <div className="relative w-full aspect-9/16 rounded-xl overflow-hidden bg-black max-h-90">
              {file?.type.startsWith("video/") ? (
                <video
                  src={preview}
                  className="w-full h-full object-contain"
                  controls
                  muted
                />
              ) : (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
              )}
              {/* Caption overlay */}
              {caption && (
                <div className="absolute bottom-4 left-0 right-0 px-3 text-center">
                  <p className="text-white text-sm drop-shadow">{caption}</p>
                </div>
              )}
            </div>

            <input
              type="text"
              maxLength={200}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Thêm chú thích..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose}>
            Huỷ
          </Button>
          <Button
            disabled={!file || createStoryMutation.isPending}
            onClick={() =>
              createStoryMutation.mutate({
                file: file!,
                caption: caption || undefined,
              })
            }
          >
            {createStoryMutation.isPending ? "Đang đăng..." : "Đăng story"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
