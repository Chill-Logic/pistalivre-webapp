import {
  CircleAlert,
  CircleCheck,
  Info,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";
import { DESKTOP_MEDIA_QUERY } from "@/constants/layout";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";

/**
 * The app's notifications (Sonner), drawn with the app's own tokens instead of
 * Sonner's pastel "rich colors": a neutral card with a soft shadow, only the
 * icon carries the color, so it follows the light/dark theme by itself.
 * Desktop: bottom right, out of the way of the header and the search. Phone:
 * top, below the notch, swipe up to dismiss. No close button (it leaves on
 * its own; an action toast keeps its action button).
 */
export function Toaster() {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  return (
    <Sonner
      position={isDesktop ? "bottom-right" : "top-center"}
      gap={8}
      offset={24}
      mobileOffset={{
        top: "calc(env(safe-area-inset-top) + 12px)",
        left: 12,
        right: 12,
      }}
      icons={{
        success: (
          <CircleCheck className="size-[18px] text-success-foreground" />
        ),
        error: <CircleAlert className="size-[18px] text-destructive" />,
        warning: (
          <TriangleAlert className="size-[18px] text-warning-foreground" />
        ),
        info: <Info className="size-[18px] text-muted-foreground" />,
        loading: (
          <LoaderCircle className="size-[18px] animate-spin text-muted-foreground" />
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-popover px-4 py-3 text-popover-foreground shadow-[0_8px_30px_rgb(0_0_0/0.12)] md:w-[360px]",
          icon: "mt-px flex size-[18px] shrink-0 items-center justify-center",
          content: "min-w-0 flex-1 space-y-0.5",
          title: "text-sm font-medium leading-5",
          description: "text-xs leading-4 text-muted-foreground",
          actionButton:
            "ml-2 shrink-0 self-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90",
          cancelButton:
            "ml-2 shrink-0 self-center rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent",
        },
      }}
    />
  );
}
