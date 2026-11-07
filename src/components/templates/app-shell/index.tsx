import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Main } from "@/components/atoms/landmarks";
import { OfflineBanner } from "@/components/molecules/offline-banner";
import { AppHeader } from "@/components/organisms/app-header";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { BottomNav } from "@/components/organisms/bottom-nav";
import { TopProgressBar } from "@/components/organisms/top-progress-bar";
import { PageSkeleton } from "@/components/templates/page-skeleton";
import type { AuthUser } from "@/types/auth";

type AppShellProps = {
  user: AuthUser;
};

/**
 * Mobile first: header + content + bottom bar. From `md` up the bottom bar
 * gives way to the sidebar.
 */
export function AppShell({ user }: AppShellProps) {
  return (
    <Box className="flex min-h-dvh">
      <TopProgressBar />
      <AppSidebar />
      <Box className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={user} />
        <OfflineBanner />
        <Main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </Main>
      </Box>
      <BottomNav />
    </Box>
  );
}
