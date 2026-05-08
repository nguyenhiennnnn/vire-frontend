import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FriendshipButton } from "../friend/friendship-button";
import { OnlineBadge } from "../shared/online-badge";
import { cn } from "../../lib/utils";
import type { User, FriendshipStatus } from "../../types";
import { AvatarDefault } from "../shared/avatar-default";
import { ImageLightbox } from "../shared/image-lightbox";
import {
  useUpdateAvatarMutation,
  useEditProfileMutation,
} from "../../hooks/use-user-mutations";
import { useFollowMutation } from "../../hooks/use-follow-mutations";
import { useDialogStore } from "../../stores/dialog-store";

interface Props {
  profile: User;
  isOwn: boolean;
  friendshipStatus: FriendshipStatus;
  isFollowing: boolean;
  onRefresh: () => void;
}

function StatItem({ count, label }: { count: number; label: string }) {
  return (
    <span>
      <span className="font-semibold text-foreground">{count}</span>{" "}
      <span>{label}</span>
    </span>
  );
}

export const ProfileInfo = ({
  profile,
  isOwn,
  friendshipStatus,
  isFollowing,
  onRefresh,
}: Props) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { show, hide } = useDialogStore();
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editBio, setEditBio] = useState(profile.bio ?? "");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const updateAvatarMutation = useUpdateAvatarMutation(profile.id);

  const editProfileMutation = useEditProfileMutation({
    profile,
    onSuccess: () => onRefresh(),
  });

  const followMutation = useFollowMutation({
    profileId: profile.id,
    isFollowing,
    onSuccess: onRefresh,
  });

  const openEdit = () => {
    setEditUsername(profile.username);
    setEditBio(profile.bio ?? "");

    show({
      title: "Chỉnh sửa trang cá nhân",

      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Username</label>

            <Input
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio</label>

            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={200}
              rows={4}
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Giới thiệu bản thân..."
            />

            <p className="text-xs text-muted-foreground text-right">
              {editBio.length}/200
            </p>
          </div>
        </div>
      ),

      footer: (
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={hide}>
            Huỷ
          </Button>

          <Button
            onClick={() =>
              editProfileMutation.mutate(
                {
                  username: editUsername,
                  bio: editBio,
                },
                {
                  onSuccess: () => {
                    hide();
                    onRefresh();
                  },
                },
              )
            }
            disabled={editProfileMutation.isPending}
          >
            {editProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      ),

      className: "sm:max-w-md",
    });
  };

  return (
    <>
      <div className="bg-card border rounded-xl p-4 -mt-16 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          {/* Avatar */}
          <div className="relative -mt-10 sm:-mt-12 mb-2 w-fit">
            <div
              className={cn(
                "rounded-full border-4 border-background overflow-hidden",
                "w-24 h-24 sm:w-28 sm:h-28",
              )}
              onClick={() => setLightboxOpen(true)}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarDefault />
              )}
            </div>

            {!isOwn && (
              <OnlineBadge
                userId={profile.id}
                size="md"
                className="absolute bottom-1 right-1 border-2 border-background"
              />
            )}

            {isOwn && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                  disabled={updateAvatarMutation.isPending}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-muted border-2 border-background rounded-full flex items-center justify-center hover:bg-muted/70 transition-colors disabled:opacity-60 z-10"
                >
                  <Camera size={13} />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    updateAvatarMutation.mutate(e.target.files[0])
                  }
                />
              </>
            )}
          </div>

          <div className="flex items-center gap-2 pb-1">
            {isOwn ? (
              <Button size="sm" variant="outline" onClick={() => openEdit()}>
                Chỉnh sửa trang cá nhân
              </Button>
            ) : (
              <>
                <FriendshipButton
                  profile={profile}
                  status={friendshipStatus}
                  onStatusChange={onRefresh}
                />
                <Button
                  size="sm"
                  variant={isFollowing ? "secondary" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    followMutation.mutate();
                  }}
                  disabled={followMutation.isPending}
                >
                  {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{profile.username}</h1>
          </div>
          {profile.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-1">
            <StatItem count={profile.friendsCount} label="Bạn bè" />
            <StatItem count={profile.followersCount} label="Người theo dõi" />
            <StatItem count={profile.followingCount} label="Đang theo dõi" />
          </div>
        </div>
      </div>

      <ImageLightbox
        key={`${lightboxOpen}`}
        images={
          profile.avatar
            ? [profile.avatar]
            : ["/assets/vire-avatar-default.svg"]
        }
        initialIndex={0}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};
