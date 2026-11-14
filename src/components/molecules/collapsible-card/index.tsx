import { ChevronDown } from "lucide-react";
import { useId, type ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Collapse } from "@/components/atoms/collapse";
import { useEmptySection } from "@/hooks/ui/useEmptySection";
import { useRememberedToggle } from "@/hooks/ui/useRememberedToggle";
import { cn } from "@/utils/cn";

type CollapsibleCardProps = {
  title: string;
  /** Shown next to the title, so a closed section still says how much it holds. */
  count?: number;
  /** Buttons on the right of the header; they stay usable when closed. */
  actions?: ReactNode;
  /** Remembers open/closed per section (e.g. "rental-documents"). */
  storageKey?: string;
  defaultOpen?: boolean;
  contentClassName?: string;
  children: ReactNode;
};

/**
 * A card whose body opens and closes sliding, from a tap on the title. On a
 * narrow screen the actions wrap below the title instead of cutting it. Empty
 * (count 0) there is nothing to open: plain title, body always shown, tighter.
 */
export function CollapsibleCard({
  title,
  count,
  actions,
  storageKey,
  defaultOpen = true,
  contentClassName,
  children,
}: CollapsibleCardProps) {
  const [open, toggle] = useRememberedToggle(
    "sections",
    storageKey,
    defaultOpen,
  );
  const contentId = useId();
  // On a page with an "Ainda sem registros" group, an empty section moves there.
  const { grouped, anchorRef } = useEmptySection({
    empty: count === 0,
    title,
    description: children,
    actions,
  });
  if (grouped) return <Box ref={anchorRef} hidden />;

  if (count === 0) {
    return (
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2 pt-3 md:pb-2 md:pt-4">
          <CardTitle className="truncate text-base">{title}</CardTitle>
          {actions && <Box className="flex flex-wrap gap-2">{actions}</Box>}
        </CardHeader>
        <CardContent
          className={cn("pb-3 text-xs md:pb-4 [&_p]:text-xs", contentClassName)}
        >
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <Button
          type="button"
          variant="ghost"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={toggle}
          className="-ml-2 h-auto md:h-auto max-w-full shrink-0 justify-start gap-2 px-2 py-1"
        >
          <CardTitle className="truncate text-base">{title}</CardTitle>
          {count !== undefined && (
            <Badge variant="neutral" className="tabular-nums">
              {count}
            </Badge>
          )}
          <ChevronDown
            aria-hidden
            className={cn(
              "text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
              !open && "-rotate-90",
            )}
          />
        </Button>
        {actions && <Box className="flex flex-wrap gap-2">{actions}</Box>}
      </CardHeader>
      <Collapse open={open} id={contentId}>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Collapse>
    </Card>
  );
}
