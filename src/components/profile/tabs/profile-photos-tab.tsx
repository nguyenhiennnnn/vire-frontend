import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Play, X } from "lucide-react";
import { postsApi } from "../../../services/api-services";
import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";
import { ImageLightbox } from "../../shared/image-lightbox";

interface Props {
  userId: string;
}

const isVideo = (url: string) => url.includes("/video/upload/");

function PhotoSkeleton() {
  return <div className="aspect-square rounded-lg bg-muted animate-pulse" />;
}

function MediaThumb({ url, onClick }: { url: string; onClick: () => void }) {
  const video = isVideo(url);
  return (
    <div
      className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer relative group"
      onClick={onClick}
    >
      {video ? (
        <>
          <video
            src={url}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
              <Play size={18} className="text-black fill-black ml-0.5" />
            </div>
          </div>
        </>
      ) : (
        <img
          src={url}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      )}
    </div>
  );
}

function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
        onClick={onClose}
      >
        <X size={22} />
      </button>
      <video
        src={src}
        controls
        autoPlay
        className="max-w-full max-h-[90vh] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export const ProfilePhotosTab = ({ userId }: Props) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["user-posts", userId],
      queryFn: ({ pageParam }) =>
        postsApi.getUserPosts(userId, pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (l) => l.nextCursor ?? undefined,
      enabled: !!userId,
    });

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const allUrls =
    data?.pages.flatMap((p) => p.data).flatMap((p) => p.mediaUrls) ?? [];
  const imageUrls = allUrls.filter((u) => !isVideo(u));

  const handleClick = (url: string) => {
    if (isVideo(url)) {
      setVideoSrc(url);
    } else {
      setLightboxIndex(imageUrls.indexOf(url));
      setLightboxOpen(true);
    }
  };

  if (!isLoading && allUrls.length === 0) {
    return (
      <p className="text-center py-12 text-sm text-muted-foreground">
        Chưa có ảnh / video nào
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {allUrls.map((url, i) => (
          <MediaThumb key={i} url={url} onClick={() => handleClick(url)} />
        ))}
        {(isLoading || isFetchingNextPage) &&
          Array.from({ length: 6 }).map((_, i) => (
            <PhotoSkeleton key={`sk-${i}`} />
          ))}
      </div>

      <div ref={sentinelRef} />

      <ImageLightbox
        images={imageUrls}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {videoSrc && (
        <VideoModal src={videoSrc} onClose={() => setVideoSrc(null)} />
      )}
    </>
  );
};
