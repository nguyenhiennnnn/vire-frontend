import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";
import { cn } from "../../lib/utils";

interface Props {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export const ImageLightbox = ({
  images,
  initialIndex = 0,
  open,
  onClose,
}: Props) => {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  const next = useCallback(
    () => setCurrent((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next, onClose]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = images[current];
    a.download = `image-${current + 1}`;
    a.target = "_blank";
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-none w-screen h-screen p-0 border-0 rounded-none bg-black/95">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-linear-to-b from-black/60 to-transparent">
          <span className="text-white/80 text-sm font-medium tabular-nums">
            {current + 1} / {images.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownload}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Download size={17} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Main image */}
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={images[current]}
            alt={`Image ${current + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-foreground/10 backdrop-blur-sm text-white hover:bg-foreground/20 transition-colors border border-white/10"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-foreground/10 backdrop-blur-sm text-white hover:bg-foreground/20 transition-colors border border-white/10"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 rounded-xl bg-black/40 backdrop-blur-sm">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "w-11 h-11 rounded-lg overflow-hidden border-2 transition-all duration-150",
                  i === current
                    ? "border-white scale-110"
                    : "border-transparent opacity-50 hover:opacity-75",
                )}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
