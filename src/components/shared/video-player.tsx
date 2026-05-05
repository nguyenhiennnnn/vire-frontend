import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

interface Props {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  aspectRatio?: string;
}

export const VideoPlayer = ({
  src,
  autoPlay = false,
  muted = false,
  className,
  aspectRatio = "16/9",
}: Props) => {
  return (
    <MediaPlayer
      src={src}
      autoPlay={autoPlay}
      muted={muted}
      playsInline
      className={className}
      style={{ aspectRatio }}
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
};
