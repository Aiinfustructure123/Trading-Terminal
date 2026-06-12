import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/[0.045]",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.35s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/[0.08] after:to-transparent",
        className,
      )}
    />
  );
}
