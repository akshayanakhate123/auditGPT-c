import { scoreBadgeClass, scoreLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono",
        scoreBadgeClass(score),
        className
      )}
    >
      {score} · {scoreLabel(score)}
    </span>
  );
}
