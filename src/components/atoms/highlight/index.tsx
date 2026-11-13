import { highlightParts } from "@/utils/highlight";
import { cn } from "@/utils/cn";

type HighlightProps = {
  text: string;
  /** Folded words to mark (see helpers/search `highlightTokens`). */
  tokens: string[];
  className?: string;
};

/** Text with the searched words in bold (accent/case-insensitive). */
export function Highlight({ text, tokens, className }: HighlightProps) {
  return (
    <span className={className}>
      {highlightParts(text, tokens).map((part, i) =>
        part.hit ? (
          <mark key={i} className={cn("rounded-sm bg-transparent font-semibold text-foreground")}>
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  );
}
