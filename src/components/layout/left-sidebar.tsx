import { Link, useLocation } from "react-router-dom";
import { Home, User, Users, Bell, Settings } from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import { useNotificationStore } from "../../stores/notification-store";
import { UserAvatar } from "../shared/user-avatar";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

const NAV_ITEMS = [
  { label: "Trang chủ", icon: Home, path: "/feed" },
  { label: "Trang cá nhân", icon: User, path: "/profile" },
  {
    label: "Bạn bè",
    icon: Users,
    path: "/friends",
    badgeKey: "friends" as const,
  },
  {
    label: "Thông báo",
    icon: Bell,
    path: "/notifications",
    badgeKey: "notif" as const,
  },
  { label: "Cài đặt", icon: Settings, path: "/settings" },
] as const;

type BadgeKey = "friends" | "notif";

export const LeftSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { unreadCount, friendRequestCount } = useNotificationStore();

  const profilePath = `/profile/${user?.id}`;

  const isActive = (path: string) =>
    location.pathname === (path === "/profile" ? profilePath : path);

  const getBadge = (key?: BadgeKey) => {
    if (key === "friends") return friendRequestCount;
    if (key === "notif") return unreadCount;
    return 0;
  };

  return (
    <nav className="space-y-0.5">
      {user && (
        <Link
          to={profilePath}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors mb-4 group"
        >
          <UserAvatar user={user} size="md" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{user.username}</p>
            <p className="text-xs text-muted-foreground truncate">
              @{user.username}
            </p>
          </div>
        </Link>
      )}

      {NAV_ITEMS.map((item) => {
        const { label, icon: Icon, path } = item;
        const href = path === "/profile" ? profilePath : path;
        const active = isActive(path);
        const count = getBadge("badgeKey" in item ? item.badgeKey : undefined);

        return (
          <Link
            key={path}
            to={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted",
            )}
          >
            <Icon size={19} strokeWidth={active ? 2.5 : 2} />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <Badge
                variant="destructive"
                className="min-w-5 h-5 px-1 text-[10px] flex items-center justify-center rounded-full"
              >
                {count > 99 ? "99+" : count}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
