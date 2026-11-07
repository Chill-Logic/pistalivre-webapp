import { Outlet } from "react-router-dom";
import { OfflineBanner } from "@/components/molecules/offline-banner";
import { AppHeader } from "@/components/organisms/app-header";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { BottomNav } from "@/components/organisms/bottom-nav";
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
    <div className="flex min-h-dvh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={user} />
        <OfflineBanner />
        <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
