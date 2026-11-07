/** Sidebar widths (px), shared by the shell and its skeleton. */
export const SIDEBAR_WIDTH = {
  expanded: 240,
  collapsed: 64,
} as const;

/** Tailwind `md`: from here up the sidebar is a column, below it a drawer. */
export const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";
