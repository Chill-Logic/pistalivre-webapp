import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import {
  SidebarContext,
  type SidebarContextValue,
} from "@/contexts/sidebar-context";
import { readSidebarCollapsed, saveSidebarCollapsed } from "@/helpers/sidebar";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

/** Single source of truth for the sidebar, read by the shell and its skeleton. */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Crossing to desktop: the drawer has no meaning there.
  useEffect(() => {
    if (isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      saveSidebarCollapsed(!current);
      return !current;
    });
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<SidebarContextValue>(
    () => ({
      isDesktop,
      isCollapsed: isDesktop && collapsed,
      isDrawerOpen,
      toggleCollapsed,
      setDrawerOpen,
      closeDrawer,
    }),
    [isDesktop, collapsed, isDrawerOpen, toggleCollapsed, closeDrawer],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
