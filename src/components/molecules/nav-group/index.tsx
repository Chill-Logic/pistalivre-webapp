import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Collapse } from "@/components/atoms/collapse";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { Text } from "@/components/atoms/text";
import { NavLink } from "@/components/molecules/nav-link";
import type { NavGroup as NavGroupEntry } from "@/constants/navigation";
import { useIsAnyRouteActive } from "@/hooks/ui/useIsAnyRouteActive";
import { useRememberedToggle } from "@/hooks/ui/useRememberedToggle";
import { cn } from "@/utils/cn";

type NavGroupProps = {
  group: NavGroupEntry;
  collapsed?: boolean;
  onNavigate?: () => void;
};

/**
 * A collapsible section of the sidebar. Remembers whether it was left open;
 * the one holding the current page is always open. On the icon-only sidebar
 * it becomes one icon that opens its items beside it.
 */
export function NavGroup({
  group,
  collapsed = false,
  onNavigate,
}: NavGroupProps) {
  const id = useId();
  const Icon = group.icon;
  const current = useIsAnyRouteActive(group.items);
  const [rememberedOpen, toggleRemembered] = useRememberedToggle(
    `nav:${group.label}`,
    false,
  );
  const open = current || rememberedOpen;

  // Icon-only sidebar: the items open on hover (and on tap). Closing waits a
  // moment, so the pointer can travel from the icon to the list.
  const [hoverOpen, setHoverOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const show = () => {
    window.clearTimeout(closeTimer.current);
    setHoverOpen(true);
  };
  const hide = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setHoverOpen(false), 150);
  };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  if (collapsed) {
    return (
      <Popover open={hoverOpen} onOpenChange={setHoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            aria-label={group.label}
            onMouseEnter={show}
            onMouseLeave={hide}
            className={cn(
              "h-11 w-full justify-center rounded-md md:h-9",
              current
                ? "bg-primary/10 text-primary hover:bg-primary/10"
                : "text-muted-foreground",
            )}
          >
            <Icon className="!size-5 shrink-0" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-56 p-2"
          onMouseEnter={show}
          onMouseLeave={hide}
          // Opened by hover: focus stays where it is (no jump into the list).
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Text
            size="xs"
            tone="muted"
            weight="medium"
            className="px-3 pb-1 pt-0.5"
          >
            {group.label}
          </Text>
          <Box className="flex flex-col gap-1">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                item={item}
                layout="side"
                onNavigate={() => {
                  setHoverOpen(false);
                  onNavigate?.();
                }}
              />
            ))}
          </Box>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Box>
      <Button
        variant="ghost"
        aria-expanded={open}
        aria-controls={id}
        // The group of the current page stays open: nothing to toggle there.
        onClick={() => !current && toggleRemembered()}
        className={cn(
          "h-11 w-full justify-start gap-3 px-3 text-sm font-medium md:h-9",
          current
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="!size-5 shrink-0" aria-hidden />
        <Text inline size={null} className="flex-1 text-left">
          {group.label}
        </Text>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </Button>
      <Collapse open={open} id={id}>
        <Box className="ml-[1.375rem] flex flex-col gap-1 border-l py-1 pl-2">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              layout="side"
              onNavigate={onNavigate}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
