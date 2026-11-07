import { createContext } from "react";

export type SidebarContextValue = {
  /** Below `md` the sidebar is a drawer; from `md` up, a column. */
  isDesktop: boolean;
  /** Narrow, icon-only column. Always false on mobile (the drawer is full). */
  isCollapsed: boolean;
  isDrawerOpen: boolean;
  toggleCollapsed: () => void;
  setDrawerOpen: (open: boolean) => void;
  closeDrawer: () => void;
};

export const SidebarContext = createContext<SidebarContextValue | null>(null);
