import { useContext } from "react";
import { SidebarContext } from "@/contexts/sidebar-context";

/** Sidebar state (desktop collapse + mobile drawer). Needs <SidebarProvider>. */
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within <SidebarProvider>");
  }
  return context;
}
