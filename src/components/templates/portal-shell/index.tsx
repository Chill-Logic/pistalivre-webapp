import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Main } from "@/components/atoms/landmarks";
import { OfflineBanner } from "@/components/molecules/offline-banner";
import { PortalHeader } from "@/components/organisms/portal-header";
import { TopProgressBar } from "@/components/organisms/top-progress-bar";
import { PageSkeleton } from "@/components/templates/page-skeleton";
import { useRealtimeSync } from "@/hooks/api/comum/realtime/useRealtimeSync";
import type { AuthUser } from "@/types/auth";

/**
 * Renter portal: mobile first, no sidebar, one narrow column even on desktop
 * (a hub the renter opens now and then, not a back office).
 */
export function PortalShell({ user }: { user: AuthUser }) {
  useRealtimeSync();
  return (
    <Box className="flex min-h-dvh flex-col">
      <TopProgressBar />
      <PortalHeader user={user} />
      <OfflineBanner />
      <Main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-4 md:pt-6">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </Main>
    </Box>
  );
}
