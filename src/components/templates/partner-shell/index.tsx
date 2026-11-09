import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Main } from "@/components/atoms/landmarks";
import { OfflineBanner } from "@/components/molecules/offline-banner";
import { PartnerAreaBottomNav } from "@/components/organisms/partner-area-bottom-nav";
import { PartnerAreaHeader } from "@/components/organisms/partner-area-header";
import { PartnerAreaSidebar } from "@/components/organisms/partner-area-sidebar";
import { TopProgressBar } from "@/components/organisms/top-progress-bar";
import { PageSkeleton } from "@/components/templates/page-skeleton";
import type { AuthUser } from "@/types/auth";

/**
 * Partner area: read only, mobile first. Phone: header + content + bottom
 * bar, like the staff's and the customer's. From `md` up it is an admin panel
 * like the staff's (collapsible sidebar, header, wide content). No install
 * invite here.
 */
export function PartnerShell({ user }: { user: AuthUser }) {
  return (
    <Box className="flex min-h-dvh">
      <TopProgressBar />
      <PartnerAreaSidebar />
      <Box className="flex min-w-0 flex-1 flex-col">
        <PartnerAreaHeader user={user} />
        <OfflineBanner />
        <Main className="w-full flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </Main>
      </Box>
      <PartnerAreaBottomNav />
    </Box>
  );
}
