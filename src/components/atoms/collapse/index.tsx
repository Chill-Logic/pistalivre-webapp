import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type CollapseProps = {
  open: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Opens and closes by animating the height (`grid-rows-[0fr]→[1fr]`, so no
 * height has to be measured). Closed content is `inert`: out of the tab
 * order and of the screen reader.
 */
export function Collapse({ open, id, className, children }: CollapseProps) {
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
