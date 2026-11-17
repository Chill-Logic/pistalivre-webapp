import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

/** Modal dialog (shadcn on Radix): focus trap, Esc, overlay click. */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

/**
 * Widths. Forms are WIDE (`lg`, fields in columns: a short screen never gets a
 * long column of fields); `sm` is for confirmations and one or two fields.
 */
const DIALOG_SIZE = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl lg:max-w-4xl",
  xl: "sm:max-w-3xl lg:max-w-5xl",
} as const;
export type DialogSize = keyof typeof DIALOG_SIZE;

/**
 * Bottom sheet on mobile (thumb reach), centered card from `sm` up. Never
 * taller than the screen: the body scrolls inside and the `DialogFooter`
 * (the buttons) stays pinned at the bottom.
 */
export function DialogContent({
  className,
  children,
  size = "md",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { size?: DialogSize }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "scrollbar-quiet fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] space-y-4 overflow-y-auto overscroll-contain rounded-t-xl border bg-card p-5 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:p-6 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95",
          DIALOG_SIZE[size],
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Edge-to-edge dark layer (photo viewer): no card, no padding. */
export function DialogFullscreenContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-0 z-50 flex flex-col text-white outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold leading-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        // Pinned to the bottom of the scrolling dialog: the buttons are always
        // in reach, however long the form. The negative margins/offset match
        // the dialog padding (p-5 / sm:p-6) so it sits flush with the edge;
        // `!` because a parent `space-y-*` zeroes the bottom margin.
        "sticky -bottom-5 z-10 -mx-5 !-mb-5 flex flex-col-reverse gap-2 border-t bg-card px-5 pb-5 pt-3 sm:-bottom-6 sm:-mx-6 sm:!-mb-6 sm:flex-row sm:justify-end sm:px-6 sm:pb-6",
        className,
      )}
      {...props}
    />
  );
}
