import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/g;
/** Punctuation that ends the sentence, not the address ("…/quero-alugar."). */
const TRAILING = /[.,;:!?)\]]+$/;

/** A link in the answer: clickable, wraps inside the bubble, with a copy button. */
function ChatLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const sameApp =
    typeof window !== "undefined" && url.startsWith(window.location.origin);
  const copy = () => {
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <span className="inline">
      <a
        href={url}
        target={sameApp ? undefined : "_blank"}
        rel={sameApp ? undefined : "noopener noreferrer"}
        className="font-medium text-primary underline decoration-primary/40 underline-offset-2 [overflow-wrap:anywhere] hover:decoration-primary"
      >
        {url}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Link copiado" : "Copiar o link"}
        title={copied ? "Copiado!" : "Copiar o link"}
        className="ml-1 inline-flex size-6 items-center justify-center rounded-md align-middle text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? (
          <Check className="size-3.5 text-success-foreground" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
      </button>
    </span>
  );
}

/** Addresses in a piece of text → ChatLink; the rest stays text. */
function links(text: string, key: string): ReactNode[] {
  return text.split(URL_PATTERN).flatMap((part, index) => {
    if (index % 2 === 0) return part ? [part] : [];
    const trailing = TRAILING.exec(part)?.[0] ?? "";
    const url = trailing ? part.slice(0, -trailing.length) : part;
    return [<ChatLink key={`${key}-${index}`} url={url} />, trailing];
  });
}

/** `**negrito**` and addresses inside a line; the rest stays plain text (never HTML). */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).flatMap((part, index): ReactNode[] =>
    /^\*\*[^*]+\*\*$/.test(part)
      ? [
          <strong key={index} className="font-semibold">
            {links(part.slice(2, -2), `b${index}`)}
          </strong>,
        ]
      : links(part, `t${index}`),
  );
}

/**
 * The assistant's answer with the little formatting it is told to use:
 * **bold**, lists with "- " (or "• ") and addresses (clickable, with a copy
 * button). Everything else is plain text —
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
  return (
    <div
      className={cn(
        "min-w-0 space-y-2 text-sm [overflow-wrap:anywhere]",
        className,
      )}
    >
      {blocks}
    </div>
  );
}
