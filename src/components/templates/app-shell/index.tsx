import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Main } from "@/components/atoms/landmarks";
import { OfflineBanner } from "@/components/molecules/offline-banner";
import { AiAssistantLauncher } from "@/components/organisms/ai-assistant-launcher";
import { AiSpotlight } from "@/components/organisms/ai-spotlight";
import { AppHeader } from "@/components/organisms/app-header";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { BottomNav } from "@/components/organisms/bottom-nav";
import { PwaInstallInvite } from "@/components/organisms/pwa-install-invite";
import { SearchPalette } from "@/components/organisms/search-palette";
import { TopProgressBar } from "@/components/organisms/top-progress-bar";
import { PageSkeleton } from "@/components/templates/page-skeleton";
import { usePageTransitionKey } from "@/hooks/ui/usePageTransitionKey";
import { useRealtimeSync } from "@/hooks/api/comum/realtime/useRealtimeSync";
import type { AuthUser } from "@/types/auth";

type AppShellProps = {
  user: AuthUser;
};

/**
 * Mobile first: header + content + bottom bar (with the menu sheet). From
 * `md` up the bottom bar gives way to the collapsible sidebar.
 */
export function AppShell({ user }: AppShellProps) {
  // Each page enters with a short fade-up (filters in the query string and
  // tabs of the same section don't replay it).
  const transitionKey = usePageTransitionKey();
  useRealtimeSync();

  return (
    <Box className="flex min-h-dvh">
      <TopProgressBar />
      <AppSidebar />
      <Box className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={user} />
        <OfflineBanner />
        <Main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <PwaInstallInvite user={user} />
          <Box
            key={transitionKey}
            className="duration-300 ease-out animate-in fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none"
          >
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </Box>
        </Main>
      </Box>
      <BottomNav user={user} />
      {user.kind === "user" && (
        <>
          <AiAssistantLauncher />
          <AiSpotlight />
          <SearchPalette user={user} />
        </>
      )}
    </Box>
  );
}
