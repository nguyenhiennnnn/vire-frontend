import { cn } from "../../lib/utils";

interface Props {
  total: number;
  current: number;
  progress: number;
}

export const StoryProgress = ({ total, current, progress }: Props) => {
  return (
    <div className="flex gap-1 px-2 pt-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden"
        >
          <div
            className={cn(
              "h-full bg-white rounded-full transition-none",
              i < current && "w-full",
              i > current && "w-0",
            )}
            style={
              i === current
                ? { width: `${progress}%`, transition: "width 100ms linear" }
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
};
