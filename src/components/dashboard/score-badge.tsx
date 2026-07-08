import { cn } from "@/lib/utils";

export function ScoreBadge({ score }: { score: number }) {
  const colorClass =
    score >= 75
      ? "bg-success/10 text-success"
      : score >= 50
        ? "bg-warning/10 text-warning"
        : "bg-destructive/10 text-destructive";

  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold", colorClass)}>
      {Math.round(score)}
    </div>
  );
}
