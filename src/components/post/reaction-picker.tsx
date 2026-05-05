import { useState } from "react";
import { cn, REACTION_EMOJI, REACTION_LABEL } from "../../lib/utils";
import type { ReactionType } from "../../types";

const REACTIONS: ReactionType[] = [
  "LIKE",
  "LOVE",
  "HAHA",
  "WOW",
  "SAD",
  "ANGRY",
];

interface Props {
  onSelect: (type: ReactionType) => void;
}

export const ReactionPicker = ({ onSelect }: Props) => {
  const [hovered, setHovered] = useState<ReactionType | null>(null);

  return (
    <div className="flex items-end gap-1 bg-popover border rounded-full shadow-xl px-3 py-2">
      {REACTIONS.map((type) => (
        <div
          key={type}
          className="relative flex flex-col items-center"
          onMouseEnter={() => setHovered(type)}
          onMouseLeave={() => setHovered(null)}
        >
          <div
            className={cn(
              "absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none",
              "bg-popover border text-foreground text-[10px] font-medium",
              "px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md",
              "transition-all duration-200 ease-out",
              hovered === type
                ? "opacity-100 -translate-y-1"
                : "opacity-0 translate-y-0",
            )}
          >
            {REACTION_LABEL[type]}
          </div>

          <button
            onClick={() => onSelect(type)}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "text-2xl leading-none p-0.5 origin-bottom select-none",
              "transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              hovered === type
                ? "scale-[1.6] -translate-y-2"
                : "scale-100 translate-y-0",
            )}
          >
            {REACTION_EMOJI[type]}
          </button>
        </div>
      ))}
    </div>
  );
};
