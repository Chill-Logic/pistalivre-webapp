import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** `**negrito**` inside a line → <strong>; the rest stays plain text (never HTML). */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    /^\*\*[^*]+\*\*$/.test(part) ? (
      <strong key={index} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

/**
 * The assistant's answer with the little formatting it is told to use:
 * **bold** and lists with "- " (or "• "). Everything else is plain text —
 * React escapes it, so a model can never inject markup.
 */
export function ChatMarkdown({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks: ReactNode[] = [];
  let items: string[] = [];
  let paragraph: string[] = [];
  const flushList = () => {
    if (!items.length) return;
    blocks.push(
      <ul key={blocks.length} className="list-disc space-y-0.5 pl-5">
        {items.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    );
    items = [];
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(
      <p key={blocks.length} className="whitespace-pre-wrap break-words">
        {inline(paragraph.join("\n"))}
      </p>,
    );
    paragraph = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-•*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      items.push(bullet[1]);
    } else if (!line.trim()) {
      flushList();
      flushParagraph();
    } else {
      flushList();
      paragraph.push(line.replace(/^#+\s*/, ""));
    }
  }
  flushList();
  flushParagraph();
  return <div className={cn("space-y-2 text-sm", className)}>{blocks}</div>;
}
