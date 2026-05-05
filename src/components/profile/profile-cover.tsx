import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { BannerDefault } from "../shared/banner-default";
import { ImageLightbox } from "../shared/image-lightbox";
import { useUpdateCoverMutation } from "../../hooks/use-user-mutations";

interface Props {
  coverPhoto: string | null;
  isOwn: boolean;
  id: string;
}

export const ProfileCover = ({ coverPhoto, isOwn, id }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const updateCoverMutation = useUpdateCoverMutation(id);

  return (
    <>
      <div
        className="relative h-48 sm:h-56 rounded-xl overflow-hidden bg-muted"
        onClick={() => setLightboxOpen(true)}
      >
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <BannerDefault />
        )}

        {isOwn && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={updateCoverMutation.isPending}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-foreground/50 hover:bg-foreground/70 disabled:opacity-60 text-background text-xs px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm z-10"
            >
              <Camera size={13} />
              {updateCoverMutation.isPending
                ? "Đang tải..."
                : "Cập nhật ảnh bìa"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                e.target.files?.[0] &&
                updateCoverMutation.mutate(e.target.files[0])
              }
            />
          </>
        )}
      </div>

      <ImageLightbox
        key={`${lightboxOpen}`}
        images={coverPhoto ? [coverPhoto] : ["/assets/vire-cover-default.svg"]}
        initialIndex={0}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};
