import { cn } from "@/lib/utils";

export function ProgressBar({
  percent,
  label,
  className,
}: {
  percent: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div
        className="h-full rounded-full bg-fg transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
