import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../../services/api-services";
import { NotificationItem } from "./notification-item";
import { NotificationSkeleton } from "../shared/skeleton-card";

export const NotificationDropdown = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications-preview"],
    queryFn: () => notificationsApi.getAll(undefined, 5),
  });

  const notifications = data?.data ?? [];

  return (
    <div className="min-w-80">
      <div className="px-4 py-3 border-b">
        <p className="font-semibold text-sm">Thông báo</p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có thông báo nào
          </p>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))
        )}
      </div>

      <div className="px-4 py-2.5 border-t">
        <Link
          to="/notifications"
          className="text-sm text-primary font-medium hover:underline"
        >
          Xem tất cả thông báo →
        </Link>
      </div>
    </div>
  );
};
