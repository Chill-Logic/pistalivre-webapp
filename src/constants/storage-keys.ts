export const STORAGE_KEYS = {
  authToken: "pl:auth-token",
  theme: "pl:theme",
  /** JSON: { collapsed, groups: { "Operação": true, … } } (helpers/ui-state). */
  sidebarState: "pl:sidebar_state",
  /** JSON: { "rental-contracts": false, … } — the cards that open and close. */
  sectionsState: "pl:sections_state",
  /** JSON: the last searches of the Ctrl+K, per user (`pl:recent_searches:<userId>`). */
  recentSearches: "pl:recent_searches",
  /** JSON: an assistant conversation, per user and place (`pl:ai_chat:<userId>:<scope>`) — survives F5. */
  aiChat: "pl:ai_chat",
  /** "1": the floating assistant was open (reopens after F5), per tab (sessionStorage). */
  aiChatOpen: "pl:ai_chat_open",
} as const;
