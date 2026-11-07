import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

type SkeletonRegionProps = {
  label?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps every skeleton. It takes the final layout's space from the first
 * frame (no layout jump) but only fades in after a short delay, so fast
 * responses never flash a skeleton. Announced once to screen readers.
 */
export function SkeletonRegion({
  label = "Carregando…",
  className,
  children,
}: SkeletonRegionProps) {
  return (
    <Box
      role="status"
      aria-busy
      className={cn(
        "animate-in fade-in fill-mode-backwards delay-150 duration-300",
        className,
      )}
    >
      <Text className="sr-only">{label}</Text>
      {children}
    </Box>
  );
}
