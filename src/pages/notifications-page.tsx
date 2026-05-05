import { useInfiniteQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { notificationsApi } from "../services/api-services";
import { useNotificationStore } from "../stores/notification-store";
import { useInfiniteScroll } from "../hooks/use-infinite-scroll";
import { NotificationItem } from "../components/notification/notification-item";
import { NotificationSkeleton } from "../components/shared/skeleton-card";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useState } from "react";
import { useMarkAllReadMutation } from "../hooks/use-notification-mutations";

export default function NotificationsPage() {
  const { unreadCount } = useNotificationStore();
  const [tab, setTab] = useState<"all" | "unread">("all");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["notifications", tab],
      queryFn: ({ pageParam }) =>
        notificationsApi.getAll(
          pageParam as string | undefined,
          20,
          tab === "unread" ? true : undefined,
        ),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
    });

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const markAllMutation = useMarkAllReadMutation();

  const notifications = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Thông báo</h1>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
        <TabsList className="w-full rounded-none h-auto p-0 bg-transparent border-b mb-4">
          <TabsTrigger
            value="all"
            className="flex-1 rounded-none py-3 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            Tất cả
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="flex-1 rounded-none py-3 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <div className="bg-card border rounded-xl overflow-hidden divide-y">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}

            {!isLoading && notifications.length === 0 && (
              <div className="py-16 text-center space-y-3">
                <Bell size={40} className="mx-auto text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">
                  {tab === "unread"
                    ? "Không có thông báo chưa đọc"
                    : "Chưa có thông báo nào"}
                </p>
              </div>
            )}

            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}

            {isFetchingNextPage && <NotificationSkeleton />}
            <div ref={sentinelRef} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
