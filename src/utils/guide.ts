import type { GuideChapter, GuideSection } from "@/types/guide";

const fold = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** The manual's steps: one per line of the section text. */
export function guideSteps(section: GuideSection): string[] {
  return section.text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Sections whose title, keywords or text have every word typed (accents and
 * case ignored), grouped by chapter in the manual's order. Empty query = all.
 */
export function guideChapters(
  areas: string[],
  sections: GuideSection[],
  query: string,
): GuideChapter[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  const hits = words.length
    ? sections.filter((s) => {
        const hay = fold([s.title, ...s.keywords, s.text].join(" "));
        return words.every((w) => hay.includes(w));
      })
    : sections;
  return areas
    .map((area) => ({ area, sections: hits.filter((s) => s.area === area) }))
    .filter((chapter) => chapter.sections.length > 0);
}

/** The sections before and after `id`, in reading order. */
export function guideNeighbours(sections: GuideSection[], id: string) {
  const at = sections.findIndex((s) => s.id === id);
  return {
    previous: at > 0 ? sections[at - 1] : null,
    next: at >= 0 && at < sections.length - 1 ? sections[at + 1] : null,
  };
}
