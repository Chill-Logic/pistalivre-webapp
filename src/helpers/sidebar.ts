import { STORAGE_KEYS } from "@/constants/storage-keys";
import { safeStorage } from "@/helpers/safe-storage";

/** Collapsed preference is per device (a laptop and a monitor differ). */
export function readSidebarCollapsed() {
  return safeStorage.get(STORAGE_KEYS.sidebarCollapsed) === "1";
}

export function saveSidebarCollapsed(collapsed: boolean) {
  safeStorage.set(STORAGE_KEYS.sidebarCollapsed, collapsed ? "1" : "0");
}
