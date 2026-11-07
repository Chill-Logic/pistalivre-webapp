import { Box } from "@/components/atoms/box";
import { Skeleton } from "@/components/atoms/skeleton";
import { cn } from "@/utils/cn";

type SkeletonTextProps = {
  /** Width of each line, e.g. ["w-24", "w-40"]. One entry per line. */
  lines: string[];
  className?: string;
};

/** Lines of text placeholder; size it with the text classes it replaces. */
export function SkeletonText({ lines, className }: SkeletonTextProps) {
  return (
    <Box className={cn("space-y-2", className)}>
      {lines.map((width, index) => (
        <Skeleton key={index} shape="text" className={width} />
      ))}
    </Box>
  );
}
