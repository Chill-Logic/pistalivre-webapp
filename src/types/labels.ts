/** A code → label map, or a list indexed by number (weekdays). */
export type LabelMap = Record<string, string> | string[];

/** Every label map the API publishes at GET /labels, by name. */
export type LabelCatalog = Record<string, LabelMap>;
