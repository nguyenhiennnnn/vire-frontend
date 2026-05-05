import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../services/api-services";
import { useAuth } from "../hooks/use-auth";
import { ProfileCover } from "../components/profile/profile-cover";
import { ProfileInfo } from "../components/profile/profile-info";
import { ProfileTabs } from "../components/profile/profile-tabs";
import type { FriendshipStatus } from "../types";

function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 sm:h-56 bg-muted rounded-xl" />
      <div className="h-40 bg-muted rounded-xl" />
      <div className="h-10 bg-muted rounded-xl" />
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => usersApi.getProfile(id ?? ""),
    enabled: !!id,
  });

  if (isLoading) return <ProfileSkeleton />;

  if (!data?.user) {
    return (
      <div className="text-center py-20 space-y-1">
        <p className="text-foreground font-medium">Không tìm thấy người dùng</p>
        <p className="text-sm text-muted-foreground">
          @{data?.user?.username || "Người dùng"} không tồn tại hoặc đã bị xoá.
        </p>
      </div>
    );
  }

  const { user: profile, friendshipStatus, isFollowing } = data;
  const isOwn = me?.id === profile.id;

  return (
    <div className="space-y-3">
      <ProfileCover
        coverPhoto={profile.coverPhoto}
        isOwn={isOwn}
        id={profile.id}
      />
      <ProfileInfo
        profile={profile}
        isOwn={isOwn}
        friendshipStatus={friendshipStatus as FriendshipStatus}
        isFollowing={isFollowing}
        onRefresh={refetch}
      />
      <ProfileTabs
        userId={profile.id}
        username={profile.username}
        myId={me?.id ?? ""}
        isOwn={isOwn}
        friendshipStatus={friendshipStatus as FriendshipStatus}
      />
    </div>
  );
}
