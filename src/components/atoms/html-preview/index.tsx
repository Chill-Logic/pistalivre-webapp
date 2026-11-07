import { cn } from "@/utils/cn";

type HtmlPreviewProps = {
  /** Already-sanitized HTML (see helpers/html). */
  html: string;
  className?: string;
};

/**
 * Read-only rendering of document HTML (contract templates). Only accepts
 * sanitized HTML; typography is scoped here so the document looks like one.
 */
export function HtmlPreview({ html, className }: HtmlPreviewProps) {
  return (
    <div
      className={cn(
        "max-w-none break-words text-sm leading-relaxed text-foreground [&_h1]:mb-4 [&_h1]:text-center [&_h1]:text-base [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_mark]:rounded [&_mark]:bg-warning [&_mark]:px-1 [&_mark]:font-mono [&_mark]:text-xs [&_mark]:text-warning-foreground [&_p]:mb-3 [&_table]:w-full [&_td]:border [&_td]:p-1",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
