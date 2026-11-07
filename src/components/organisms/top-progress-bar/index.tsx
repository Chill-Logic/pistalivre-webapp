import { Box } from "@/components/atoms/box";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { useIsLoadingAnything } from "@/hooks/ui/useIsLoadingAnything";

/**
 * Global activity line at the very top: covers refetches, page changes and
 * saves, where content is already on screen and a skeleton would be wrong.
 */
export function TopProgressBar() {
  const loading = useIsLoadingAnything();
  if (!loading) return null;

  return (
    <Box className="fixed inset-x-0 top-0 z-[60] animate-in fade-in fill-mode-backwards delay-200 duration-200">
      <ProgressBar />
    </Box>
  );
}
