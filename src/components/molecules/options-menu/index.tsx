import { MoreHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import { Text } from "@/components/atoms/text";

type OptionsMenuProps = {
  /** Groups of actions (buttons, dialog triggers, links), split by a line. */
  groups: ReactNode[];
  label?: string;
};

/**
 * "Opções": the actions of a record, out of the way. Items are often dialog
 * triggers, so the list stays mounted (only hidden) after the menu closes —
 * otherwise the dialog it just opened would vanish with it.
 */
export function OptionsMenu({ groups, label = "Opções" }: OptionsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label={label}>
          <MoreHorizontal />
          <Text inline size={null} className="hidden sm:inline">
            {label}
          </Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        forceMount
        align="end"
        className="w-56 p-1 data-[state=closed]:hidden"
        // Picking an item closes the menu; its dialog (if any) stays alive.
        onClickCapture={() => setOpen(false)}
      >
        {groups.map((group, index) => (
          <Box
            key={index}
            className="flex flex-col border-t py-1 first:border-t-0 empty:hidden [&_a]:flex [&_a]:w-full [&_a]:items-center [&_a]:justify-start [&_a]:gap-2 [&_a]:rounded-sm [&_a]:px-3 [&_a]:py-2 [&_a]:text-sm hover:[&_a]:bg-muted [&_button]:w-full [&_button]:justify-start [&_button]:text-sm [&_button]:border-0 [&_button]:bg-transparent [&_button]:shadow-none hover:[&_button]:bg-muted"
          >
            {group}
          </Box>
        ))}
      </PopoverContent>
    </Popover>
  );
}
