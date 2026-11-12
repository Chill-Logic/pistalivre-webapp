export const STORAGE_KEYS = {
  authToken: "pl:auth-token",
  theme: "pl:theme",
  /** JSON: { collapsed, groups: { "Operação": true, … } } (helpers/ui-state). */
  sidebarState: "pl:sidebar_state",
  /** JSON: { "rental-contracts": false, … } — the cards that open and close. */
  sectionsState: "pl:sections_state",
} as const;
