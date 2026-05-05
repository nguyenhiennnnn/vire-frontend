import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { reactionsApi } from "../../services/api-services";
import { REACTION_EMOJI, REACTION_LABEL } from "../../lib/utils";
import type { ReactionType, ReactionSummary, Reaction } from "../../types";
import {
  UserListItemSkeleton,
  UserCardSkeleton,
} from "../shared/skeleton-card";
import { AvatarDefault } from "../shared/avatar-default";
import { useInfiniteScroll } from "../../hooks/use-infinite-scroll";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";

const ALL_TYPES: ReactionType[] = [
  "LIKE",
  "LOVE",
  "HAHA",
  "WOW",
  "SAD",
  "ANGRY",
];

interface Props {
  postId: string;
  open: boolean;
  onClose: () => void;
  summary: ReactionSummary;
  defaultTab: ReactionType | "ALL";
}

interface ListProps {
  postId: string;
  type?: ReactionType;
}

const ReactionList = ({ postId, type }: ListProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["reactions", postId, type ?? "ALL"],
      queryFn: ({ pageParam }) =>
        reactionsApi.getByPost(
          postId,
          pageParam as string | undefined,
          20,
          type,
        ),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
    });

  const sentinelRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const items = data?.pages.flatMap((p) => p.data) ?? [];

  if (isLoading) {
    return <UserListItemSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Chưa có cảm xúc nào
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-80 p-2">
      {items.map((reaction: Reaction) => (
        <Link
          key={reaction.id}
          to={`/profile/${reaction.user.id}`}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="relative shrink-0">
            {reaction.user?.avatar ? (
              <img
                src={reaction.user.avatar}
                alt={reaction.user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <AvatarDefault size="small" />
            )}
            <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">
              {REACTION_EMOJI[reaction.type]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {reaction.user?.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {REACTION_LABEL[reaction.type]}
            </p>
          </div>
        </Link>
      ))}
      <div ref={sentinelRef} />
      {isFetchingNextPage && <UserCardSkeleton />}
    </div>
  );
};

export const ReactionListModal = ({
  postId,
  open,
  onClose,
  summary,
  defaultTab,
}: Props) => {
  const [activeTab, setActiveTab] = useState<ReactionType | "ALL">(defaultTab);

  const activeTabs = ALL_TYPES.filter((t) => summary.byType[t] > 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-sm">Cảm xúc</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ReactionType | "ALL")}
        >
          <div className="border-b overflow-x-auto scrollbar-none">
            <TabsList className="h-auto bg-transparent rounded-none px-2 gap-0 w-max">
              <TabsTrigger
                value="ALL"
                className="px-3 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
              >
                Tất cả {summary.total}
              </TabsTrigger>
              {activeTabs.map((type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="px-3 py-2 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
                >
                  {REACTION_EMOJI[type]} {summary.byType[type]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="ALL" className="mt-0">
            <ReactionList postId={postId} />
          </TabsContent>
          {activeTabs.map((type) => (
            <TabsContent key={type} value={type} className="mt-0">
              <ReactionList postId={postId} type={type} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
