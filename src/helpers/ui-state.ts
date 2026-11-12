import { STORAGE_KEYS } from "@/constants/storage-keys";
import { safeStorage } from "@/helpers/safe-storage";

/**
 * What the screen remembers per viewer (this browser), as two JSON objects
 * instead of one loose key per toggle:
 *
 *   pl:sidebar_state  = { "collapsed": false, "groups": { "Operação": true, … } }
 *   pl:sections_state = { "rental-contracts": false, "customer-debts": true, … }
 */
export type SidebarState = {
  collapsed: boolean;
  groups: Record<string, boolean>;
};
export type SectionsState = Record<string, boolean>;

/** Which remembered object a toggle lives in. */
export type UiStore = "sidebar" | "sections";

const LEGACY_PREFIX = "pl:open:";
const LEGACY_NAV = "nav:";
const LEGACY_COLLAPSED = "pl:sidebar-collapsed";

function readJson<T>(key: string, fallback: T): T {
  const raw = safeStorage.get(key);
  if (!raw) return fallback;
  try {
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === "object" ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * The loose keys of earlier versions (pl:open:…, pl:sidebar-collapsed) move
 * into the two objects once, then go away — nobody loses what they left open.
 */
let migrated = false;
function migrateLegacy() {
  if (migrated) return;
  migrated = true;
  let keys: string[] = [];
  try {
    keys = Object.keys(window.localStorage).filter(
      (k) => k.startsWith(LEGACY_PREFIX) || k === LEGACY_COLLAPSED,
    );
  } catch {
    return;
  }
  if (!keys.length) return;
  const sidebar = readJson<SidebarState>(STORAGE_KEYS.sidebarState, {
    collapsed: false,
    groups: {},
  });
  const sections = readJson<SectionsState>(STORAGE_KEYS.sectionsState, {});
  for (const key of keys) {
    const on = safeStorage.get(key) === "1";
    if (key === LEGACY_COLLAPSED) sidebar.collapsed = on;
    else {
      const name = key.slice(LEGACY_PREFIX.length);
      if (name.startsWith(LEGACY_NAV))
        sidebar.groups[name.slice(LEGACY_NAV.length)] = on;
      else sections[name] = on;
    }
    safeStorage.remove(key);
  }
  safeStorage.set(STORAGE_KEYS.sidebarState, JSON.stringify(sidebar));
  safeStorage.set(STORAGE_KEYS.sectionsState, JSON.stringify(sections));
}

export function readSidebarState(): SidebarState {
  migrateLegacy();
  const state = readJson<Partial<SidebarState>>(STORAGE_KEYS.sidebarState, {});
  return { collapsed: state.collapsed === true, groups: state.groups ?? {} };
}

export function updateSidebarState(
  change: (state: SidebarState) => SidebarState,
) {
  safeStorage.set(
    STORAGE_KEYS.sidebarState,
    JSON.stringify(change(readSidebarState())),
  );
}

function readSections(): SectionsState {
  migrateLegacy();
  return readJson<SectionsState>(STORAGE_KEYS.sectionsState, {});
}

/** A remembered open/closed (undefined = never set). */
export function readToggle(store: UiStore, name: string): boolean | undefined {
  return store === "sidebar"
    ? readSidebarState().groups[name]
    : readSections()[name];
}

export function saveToggle(store: UiStore, name: string, open: boolean) {
  if (store === "sidebar") {
    updateSidebarState((state) => ({
      ...state,
      groups: { ...state.groups, [name]: open },
    }));
  } else {
    safeStorage.set(
      STORAGE_KEYS.sectionsState,
      JSON.stringify({ ...readSections(), [name]: open }),
    );
  }
}
