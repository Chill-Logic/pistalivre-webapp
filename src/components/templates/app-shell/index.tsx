import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
 * Mobile first: header + content + bottom bar (with the menu sheet). From
 * `md` up the bottom bar gives way to the collapsible sidebar.
 */
export function AppShell({ user }: AppShellProps) {
  // Keyed by path: each page enters with a short fade-up (filters in the
  // query string don't replay it).
  const { pathname } = useLocation();

  return (
    <Box className="flex min-h-dvh">
      <TopProgressBar />
      <AppSidebar />
      <Box className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={user} />
        <OfflineBanner />
        <Main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <Box
            key={pathname}
            className="duration-300 ease-out animate-in fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none"
          >
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </Box>
        </Main>
      </Box>
      <BottomNav user={user} />
    </Box>
  );
}
