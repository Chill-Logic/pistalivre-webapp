import { readSidebarState, updateSidebarState } from "@/helpers/ui-state";

/** Collapsed preference is per device (a laptop and a monitor differ). */
export function readSidebarCollapsed() {
  return readSidebarState().collapsed;
}

export function saveSidebarCollapsed(collapsed: boolean) {
  updateSidebarState((state) => ({ ...state, collapsed }));
}
