import { lazy, Suspense } from "react";
import { Box } from "@/components/atoms/box";

// Dev-only chunk: production builds never download the devtools.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : null;

export function QueryDevtools() {
  if (!ReactQueryDevtools) return null;

  return (
    // Desktop only: on phones the floating button covers the bottom nav.
    <Box className="hidden md:block">
      <Suspense fallback={null}>
        <ReactQueryDevtools buttonPosition="bottom-right" />
      </Suspense>
    </Box>
  );
}
