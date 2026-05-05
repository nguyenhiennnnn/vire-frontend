import { cn } from "../../lib/utils";

interface Props {
  className?: string;
}

const Shimmer = ({ className }: Props) => (
  <div className={cn("animate-pulse rounded-md bg-muted", className)} />
);

/** Skeleton for a PostCard while data loads */
export const PostCardSkeleton = () => (
  <div className="rounded-xl border bg-card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Shimmer className="w-11 h-11 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-3 w-20" />
      </div>
    </div>
    <Shimmer className="h-4 w-full" />
    <Shimmer className="h-4 w-3/4" />
    <Shimmer className="h-48 w-full rounded-lg" />
    <div className="flex gap-4 pt-1">
      <Shimmer className="h-8 w-20" />
      <Shimmer className="h-8 w-20" />
    </div>
  </div>
);

/** Skeleton for a user card (friend/follower/suggestion) */
export const UserCardSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-lg border">
    <Shimmer className="w-12 h-12 rounded-full" />
    <div className="flex-1 space-y-1.5">
      <Shimmer className="h-4 w-28" />
      <Shimmer className="h-3 w-20" />
    </div>
    <Shimmer className="h-8 w-20 rounded-md" />
  </div>
);

/** Skeleton for a notification item */
export const NotificationSkeleton = () => (
  <div className="flex items-start gap-3 p-3">
    <Shimmer className="w-12 h-12 rounded-full shrink-0" />
    <div className="flex-1 space-y-1.5">
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-3 w-24" />
    </div>
    <Shimmer className="w-12 h-12 rounded-md shrink-0" />
  </div>
);

/** Generic block shimmer */
export const BlockSkeleton = ({ className }: Props) => (
  <Shimmer className={cn("h-20 w-full rounded-lg", className)} />
);

export const UserListItemSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Shimmer className="w-9 h-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-2.5 w-16" />
        </div>
      </div>
    ))}
  </div>
);
