import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type AiAnchorProps = {
  /** The section's name, as the AI's sources say it ("charges", "summary"…). */
  id: string;
  className?: string;
  children: ReactNode;
};

/**
 * Marks a section the assistant can point at ("Mostrar onde vi isso"): the
 * guide finds it by `data-ai-anchor`, scrolls to it and draws the highlight.
 */
export function AiAnchor({ id, className, children }: AiAnchorProps) {
  return (
    <div data-ai-anchor={id} className={cn("scroll-mt-24", className)}>
      {children}
    </div>
  );
}
