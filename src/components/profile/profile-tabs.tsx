import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ProfilePostsTab } from "./tabs/profile-posts-tab";
import { ProfilePhotosTab } from "./tabs/profile-photos-tab";
import { ProfileFriendsTab } from "./tabs/profile-friends-tab";
import { ProfileFollowersTab } from "./tabs/profile-followers-tab";
import { ProfileFollowingTab } from "./tabs/profile-following-tab";
import { ProfileStoriesTab } from "./tabs/profile-stories-tab";
import type { FriendshipStatus } from "../../types";

const TABS = [
  { value: "posts", label: "Bài viết" },
  { value: "photos", label: "Ảnh" },
  { value: "friends", label: "Bạn bè" },
  { value: "followers", label: "Theo dõi" },
  { value: "following", label: "Đang theo dõi" },
  { value: "stories", label: "Story" },
] as const;

interface Props {
  userId: string;
  username: string;
  myId: string;
  isOwn: boolean;
  friendshipStatus: FriendshipStatus;
}

export const ProfileTabs = ({
  userId,
  username,
  myId,
  isOwn,
  friendshipStatus,
}: Props) => {
  return (
    <Tabs defaultValue="posts">
      <div className="bg-card border rounded-xl overflow-hidden sticky top-14 z-10">
        <TabsList className="w-full rounded-none h-auto p-0 bg-transparent border-b">
          {TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 rounded-none py-3 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="posts" className="mt-3">
        <ProfilePostsTab userId={userId} myId={myId} />
      </TabsContent>
      <TabsContent value="photos" className="mt-3">
        <ProfilePhotosTab userId={userId} />
      </TabsContent>
      <TabsContent value="friends" className="mt-3">
        <ProfileFriendsTab userId={userId} />
      </TabsContent>
      <TabsContent value="followers" className="mt-3">
        <ProfileFollowersTab userId={userId} />
      </TabsContent>
      <TabsContent value="following" className="mt-3">
        <ProfileFollowingTab userId={userId} />
      </TabsContent>
      <TabsContent value="stories" className="mt-3">
        <ProfileStoriesTab
          userId={userId}
          username={username}
          isOwn={isOwn}
          friendshipStatus={friendshipStatus}
        />
      </TabsContent>
    </Tabs>
  );
};
