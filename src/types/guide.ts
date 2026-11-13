/** One section of the system's manual (GET /guide). */
export type GuideSection = {
  id: string;
  /** The chapter it belongs to ("Cobrança e financeiro"…). */
  area: string;
  title: string;
  keywords: string[];
  /** One step per line. */
  text: string;
};

export type GuideResponse = {
  /** Chapters, in order. */
  areas: string[];
  sections: GuideSection[];
};

/** A chapter with its sections, as the index shows it. */
export type GuideChapter = { area: string; sections: GuideSection[] };
