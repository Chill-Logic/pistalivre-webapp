import { Menu } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

type BottomNavMenuButtonProps = {
  /** The current page is not one of the bar's destinations. */
  isActive: boolean;
  isOpen: boolean;
  onOpen: () => void;
};

/** Last slot of the bottom bar: opens the menu sheet. */
export function BottomNavMenuButton({
  isActive,
  isOpen,
  onOpen,
}: BottomNavMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className={cn(
        "group h-auto min-h-14 flex-1 flex-col gap-1 rounded-none px-0 text-[11px] font-medium hover:bg-transparent",
        isActive || isOpen
          ? "text-primary hover:text-primary"
          : "text-muted-foreground",
      )}
    >
      <Box
        className={cn(
          "flex h-7 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-300 ease-out",
          (isActive || isOpen) && "bg-primary/10",
        )}
      >
        <Menu className="size-5" aria-hidden />
      </Box>
      <Text inline size={null}>
        Menu
      </Text>
    </Button>
  );
}
