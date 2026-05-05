import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reactionsApi } from "../../services/api-services";
import { REACTION_EMOJI } from "../../lib/utils";
import type { ReactionType } from "../../types";
import { ReactionListModal } from "./reaction-list-modal";

interface Props {
  postId: string;
}

export const ReactionSummaryBar = ({ postId }: Props) => {
  const [open, setOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<ReactionType | "ALL">("ALL");

  const { data } = useQuery({
    queryKey: ["reaction-summary", postId],
    queryFn: () => reactionsApi.getSummary(postId),
  });

  if (!data || data.total === 0) return null;

  const topTypes = (Object.entries(data.byType) as [ReactionType, number][])
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);

  const handleBadgeClick = (e: React.MouseEvent, type: ReactionType) => {
    e.stopPropagation();
    setDefaultTab(type);
    setOpen(true);
  };

  const handleTotalClick = () => {
    setDefaultTab("ALL");
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleTotalClick}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      >
        <span className="flex items-center">
          {topTypes.map((type) => (
            <span
              key={type}
              className="text-sm -ml-0.5 first:ml-0 hover:scale-125 transition-transform"
              onClick={(e) => handleBadgeClick(e, type)}
              title={type}
            >
              {REACTION_EMOJI[type]}
            </span>
          ))}
        </span>
        <span className="group-hover:underline">{data.total}</span>
      </button>

      <ReactionListModal
        key={`${postId}-${open}`}
        postId={postId}
        open={open}
        onClose={() => setOpen(false)}
        summary={data}
        defaultTab={defaultTab}
      />
    </>
  );
};
