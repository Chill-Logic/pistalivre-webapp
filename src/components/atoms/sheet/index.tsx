import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

/**
 * Drawer (shadcn Sheet on Radix Dialog): focus trap, Esc, overlay click.
 * `bottom` is the native-looking bottom sheet (handle, rounded top, slides
 * up); it closes by overlay/Esc/choosing an item, so it has no X.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "left",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "left" | "right" | "bottom";
}) {
  const isBottom = side === "bottom";
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col bg-card shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300 motion-reduce:animate-none",
          !isBottom && "inset-y-0 h-full w-[80vw] max-w-xs",
          side === "left" &&
            "left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          side === "right" &&
            "right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          isBottom &&
            "inset-x-0 bottom-0 h-[70dvh] rounded-t-2xl border-t data-[state=open]:duration-500 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className,
        )}
        {...props}
      >
        {isBottom && (
          <div
            aria-hidden
            className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border"
          />
        )}
        {children}
        {!isBottom && (
          <DialogPrimitive.Close
            className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Required by Radix for screen readers; hide it visually with `sr-only`. */
export function SheetTitle(
  props: ComponentProps<typeof DialogPrimitive.Title>,
) {
  return <DialogPrimitive.Title {...props} />;
}

export function SheetDescription(
  props: ComponentProps<typeof DialogPrimitive.Description>,
) {
  return <DialogPrimitive.Description {...props} />;
}
