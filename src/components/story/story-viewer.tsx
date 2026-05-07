import { useState, useEffect, useCallback, useRef } from "react";
import { X, Trash2, Eye, ChevronLeft, VolumeX, Volume2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storiesApi } from "../../services/api-services";
import { useAuth } from "../../hooks/use-auth";
import { UserAvatar } from "../shared/user-avatar";
import { StoryProgress } from "./story-progress";
import { fromNow } from "../../lib/utils";
import type { StoryGroup } from "../../types";
import { StoryViewersDialog } from "./story-viewers-dialog";
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
import { useDeleteStoryMutation } from "../../hooks/use-story-mutations";
import { useSocket } from "../../hooks/use-socket";
import { storyEvents } from "../../socket/register-story-listeners";
import { useSocketStore } from "../../stores/socket-store";

const STORY_DURATION = 5000;
const TICK = 100;

interface Props {
  open: boolean;
  onClose: () => void;
  groups: StoryGroup[];
  initialGroupIndex?: number;
}

export const StoryViewer = ({
  open,
  onClose,
  groups,
  initialGroupIndex = 0,
}: Props) => {
  const { user } = useAuth();
  const { joinStoryRoom, leaveStoryRoom } = useSocket();
  const { socket } = useSocketStore();

  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [deleteStotyOpen, setDeleteStoryOpen] = useState(false);
  const [muted, setMuted] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goNextRef = useRef<() => void>(() => {});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef(0);

  const currentGroup = groups[groupIdx];
  const currentStory = currentGroup?.stories[storyIdx];
  const isOwn = user?.id === currentGroup.user.id;

  const videoDurationRef = useRef<number>(STORY_DURATION);
  const [mediaReady, setMediaReady] = useState(
    currentStory?.mediaType !== "VIDEO",
  );

  const goNext = useCallback(() => {
    const group = groups[groupIdx];
    if (!group) {
      onClose();
      return;
    }
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx((i) => i + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx((g) => g + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  }, [groupIdx, storyIdx, groups, onClose]);

  useEffect(() => {
    if (!currentStory?.id) return;
    joinStoryRoom(currentStory.id);
    return () => {
      leaveStoryRoom(currentStory.id);
    };
  }, [currentStory?.id, joinStoryRoom, leaveStoryRoom, socket?.connected]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { storyId } = (e as CustomEvent<{ storyId: string }>).detail;
      if (storyId === currentStory?.id) goNextRef.current();
    };
    storyEvents.addEventListener("story_deleted", handler);
    return () => storyEvents.removeEventListener("story_deleted", handler);
  }, [currentStory?.id]);

  useEffect(() => {
    videoDurationRef.current = STORY_DURATION;
  }, [currentStory?.id]);

  useEffect(() => {
    goNextRef.current = goNext;
  }, [goNext]);

  const goPrev = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx((i) => i - 1);
    } else if (groupIdx > 0) {
      const prevGroup = groups[groupIdx - 1];
      setGroupIdx((g) => g - 1);
      setStoryIdx(prevGroup.stories.length - 1);
    }
  }, [groupIdx, storyIdx, groups]);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + (TICK / videoDurationRef.current) * 100;
        if (next >= 100) {
          goNextRef.current();
          return 0;
        }
        return next;
      });
    }, TICK);
  }, []);

  useEffect(() => {
    if (!open || paused || viewersOpen || !mediaReady) {
      clearTimer();
      if (videoRef.current) videoRef.current.pause();
      return;
    }
    if (videoRef.current) {
      const elapsed = (progressRef.current / 100) * videoDurationRef.current;
      if (videoRef.current.currentTime !== undefined && elapsed > 0) {
        videoRef.current.currentTime = elapsed / 1000;
      }
      videoRef.current.play().catch(() => null);
    }

    const t = setTimeout(() => startTimer(), 0);
    return () => {
      clearTimeout(t);
      clearTimer();
    };
  }, [open, groupIdx, storyIdx, paused, viewersOpen, startTimer, mediaReady]);

  useEffect(() => () => clearTimer(), []);

  useEffect(() => {
    if (!open || !currentStory || isOwn) return;
    const t = setTimeout(() => {
      storiesApi.recordView(currentStory.id).catch(() => null);
    }, 300);
    return () => clearTimeout(t);
  }, [open, currentStory?.id, isOwn]);

  const { data: viewersData } = useQuery({
    queryKey: ["story-viewers", currentStory?.id],
    queryFn: () => storiesApi.getViewers(currentStory!.id),
    enabled: isOwn && !!currentStory?.id,
    // refetchInterval: !isOwn || !currentStory?.id ? false : 5000,
  });

  const deleteStoryMutation = useDeleteStoryMutation({
    onSuccess: () => goNext(),
  });

  if (!open || !currentGroup || !currentStory) return null;

  const viewsCount = viewersData?.totalViews ?? currentStory.viewsCount ?? 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-sm h-full max-h-[90vh] overflow-hidden rounded-xl bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          <StoryProgress
            total={currentGroup.stories.length}
            current={storyIdx}
            progress={progress}
          />

          <div className="absolute top-6 left-0 right-0 z-10 flex items-center gap-2 px-3 py-2">
            <UserAvatar user={currentGroup.user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium leading-none drop-shadow-md">
                {currentGroup.user.username}
              </p>
              <p className="text-white/80 text-xs mt-0.5 drop-shadow-md">
                {fromNow(currentStory.createdAt)}
              </p>
            </div>
            {currentStory.mediaType === "VIDEO" && (
              <button
                className="text-white p-1.5 rounded-full transition-colors bg-black/40 hover:bg-black/60 backdrop-blur-sm shadow"
                onClick={() => setMuted((m) => !m)}
                title={muted ? "Bật tiếng" : "Tắt tiếng"}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            )}
            {isOwn && (
              <button
                className="text-white p-1.5 rounded-full transition-colors bg-black/40 hover:bg-black/60 backdrop-blur-sm shadow"
                onClick={() => setDeleteStoryOpen(true)}
                disabled={deleteStoryMutation.isPending}
                title="Xoá story"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              className="text-white p-1.5 rounded-full transition-colors bg-black/40 hover:bg-black/60 backdrop-blur-sm shadow"
              onClick={onClose}
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {currentStory.mediaType === "VIDEO" ? (
            <video
              ref={videoRef}
              key={currentStory.id}
              src={currentStory.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              muted={muted}
              playsInline
              onLoadedMetadata={(e) => {
                const dur = e.currentTarget.duration;
                if (dur && isFinite(dur)) videoDurationRef.current = dur * 1000;
                setMediaReady(true);
              }}
            />
          ) : (
            <img
              key={currentStory.id}
              src={currentStory.mediaUrl}
              className="w-full h-full object-contain"
              alt="story"
            />
          )}

          {currentStory.caption && (
            <div className="absolute bottom-8 left-0 right-0 px-4 py-3 bg-linear-to-t from-black/70 to-transparent">
              <p className="text-white text-sm text-center drop-shadow">
                {currentStory.caption}
              </p>
            </div>
          )}

          {isOwn && (
            <button
              onClick={() => {
                setPaused(true);
                setViewersOpen(true);
              }}
              className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-4 py-3 bg-linear-to-t from-black/70 to-transparent hover:from-black/80 transition-colors z-10"
            >
              <Eye size={16} className="text-white/80" />
              <span className="text-white text-sm font-medium">
                {viewsCount} lượt xem
              </span>
              <ChevronLeft
                size={14}
                className="text-white/60 rotate-90 ml-auto"
              />
            </button>
          )}

          <button
            className="absolute inset-y-0 left-0 w-1/2 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Trước"
          />
          <button
            className="absolute inset-y-0 right-0 w-1/2 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Tiếp"
          />
        </div>
      </div>

      {isOwn && currentStory && (
        <StoryViewersDialog
          storyId={currentStory.id}
          open={viewersOpen}
          onClose={() => {
            setViewersOpen(false);
            setPaused(false);
          }}
        />
      )}

      <AlertDialog open={deleteStotyOpen} onOpenChange={setDeleteStoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá story?</AlertDialogTitle>
            <AlertDialogDescription>
              Story sẽ bị xoá vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                onClose();
                deleteStoryMutation.mutate(currentStory.id);
              }}
              disabled={deleteStoryMutation.isPending}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
