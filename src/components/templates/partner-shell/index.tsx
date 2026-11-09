import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Main } from "@/components/atoms/landmarks";
import { OfflineBanner } from "@/components/molecules/offline-banner";
import { PartnerAreaHeader } from "@/components/organisms/partner-area-header";
import { PartnerAreaSidebar } from "@/components/organisms/partner-area-sidebar";
import { TopProgressBar } from "@/components/organisms/top-progress-bar";
import { PageSkeleton } from "@/components/templates/page-skeleton";
import type { AuthUser } from "@/types/auth";

/**
 * Partner area: read only, mobile first. Phone and tablet: a simple header
 * over a centered column. From `lg` up it is an admin panel like the staff's
 * (fixed sidebar, header, wide content). No install invite here.
 */
export function PartnerShell({ user }: { user: AuthUser }) {
  return (
    <Box className="flex min-h-dvh">
      <TopProgressBar />
      <PartnerAreaSidebar />
      <Box className="flex min-w-0 flex-1 flex-col">
        <PartnerAreaHeader user={user} />
        <OfflineBanner />
        <Main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-4 md:pt-6 lg:mx-0 lg:max-w-none lg:px-8 lg:pb-8">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </Main>
      </Box>
    </Box>
  );
}
