import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Main } from "@/components/atoms/landmarks";
import { OfflineBanner } from "@/components/molecules/offline-banner";
import { PartnerAreaHeader } from "@/components/organisms/partner-area-header";
import { TopProgressBar } from "@/components/organisms/top-progress-bar";
import { PageSkeleton } from "@/components/templates/page-skeleton";
import type { AuthUser } from "@/types/auth";

/**
 * Partner area: read only, mobile first, no sidebar. Wider than the renter's
 * portal on the desktop (contracts and motorcycles read better side by side,
 * and the statements as tables). No install invite here.
 */
export function PartnerShell({ user }: { user: AuthUser }) {
  return (
    <Box className="flex min-h-dvh flex-col">
      <TopProgressBar />
      <PartnerAreaHeader user={user} />
      <OfflineBanner />
      <Main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-4 md:pt-6">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </Main>
    </Box>
  );
}
