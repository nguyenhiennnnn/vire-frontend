import { useRef } from "react";
import { Image, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { FileUploadState } from "../../hooks/use-cloudinary-upload";

interface Props {
  items: FileUploadState[];
  onAddFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxFiles?: number;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export const MediaUploadZone = ({
  items,
  onAddFiles,
  onRemove,
  maxFiles = 10,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onAddFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  if (items.length === 0) {
    return (
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted hover:border-primary/40 hover:bg-muted/30",
        )}
      >
        <Image size={26} className="mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          Kéo thả ảnh / video vào đây
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Hoặc click để chọn · Tối đa {maxFiles} file · Ảnh 50MB · Video 100MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "grid gap-1.5",
          items.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="relative rounded-xl overflow-hidden bg-muted aspect-video group"
          >
            {item.file.type.startsWith("video/") ? (
              <video
                src={item.preview}
                className="w-full h-full object-cover"
                controls
                playsInline
                muted
              />
            ) : (
              <img
                src={item.preview}
                alt=""
                className="w-full h-full object-cover"
              />
            )}

            {item.status === "uploading" && (
              <div className="absolute inset-0 bg-foreground/50 flex flex-col items-center justify-center gap-2">
                <Loader2 size={20} className="text-background animate-spin" />
                <div className="w-3/4 h-1.5 bg-background/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-background rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="text-background text-xs font-medium">
                  {item.progress}%
                </span>
              </div>
            )}

            {item.status === "error" && (
              <div className="absolute inset-0 bg-destructive/70 flex flex-col items-center justify-center gap-1 p-2">
                <AlertCircle
                  size={20}
                  className="text-destructive-foreground"
                />
                <p className="text-destructive-foreground text-xs text-center leading-tight">
                  {item.error ?? "Upload thất bại"}
                </p>
              </div>
            )}

            {item.status === "done" && (
              <div className="absolute top-2 left-2">
                <CheckCircle2
                  size={18}
                  className="text-primary drop-shadow-sm"
                />
              </div>
            )}

            {item.status !== "uploading" && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-foreground/60 text-background flex items-center justify-center hover:bg-foreground/80 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}

        {items.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-muted hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Image size={18} />
            <span className="text-xs">Thêm</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};
