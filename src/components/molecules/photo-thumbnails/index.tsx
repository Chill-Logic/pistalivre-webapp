import { useEffect, useRef } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { SecureImage } from "@/components/molecules/secure-image";
import type { GalleryPhoto } from "@/types/document";
import { cn } from "@/utils/cn";

type PhotoThumbnailsProps = {
  photos: GalleryPhoto[];
  index: number;
  onSelect: (index: number) => void;
  /** Light ring on the dark full screen. */
  tone?: "default" | "inverted";
  /** Share the width (card) instead of fixed-size previews (full screen). */
  fill?: boolean;
  className?: string;
};

/** Strip of previews under the carousel; the current one is ringed. */
export function PhotoThumbnails({
  photos,
  index,
  onSelect,
  tone = "default",
  fill = false,
  className,
}: PhotoThumbnailsProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep the current preview in sight when the strip overflows (only the
  // strip scrolls: scrollIntoView would also move the page).
  useEffect(() => {
    const strip = stripRef.current;
    const item = itemRefs.current[index];
    if (!strip || !item) return;
    const start = item.offsetLeft; // the strip is the offsetParent (relative)
    const end = start + item.offsetWidth;
    if (start < strip.scrollLeft) strip.scrollLeft = start - 8;
    else if (end > strip.scrollLeft + strip.clientWidth)
      strip.scrollLeft = end - strip.clientWidth + 8;
  }, [index]);

  return (
    <Box
      ref={stripRef}
      className={cn(
        "relative flex gap-2 overflow-x-auto p-1 [scrollbar-width:thin]",
        className,
      )}
    >
      {photos.map((photo, photoIndex) => {
        const isCurrent = photoIndex === index;
        return (
          <Button
            key={photo.key}
            ref={(node) => {
              itemRefs.current[photoIndex] = node;
            }}
            type="button"
            variant="ghost"
            title={photo.label}
            aria-label={`Ver ${photo.label}`}
            aria-current={isCurrent || undefined}
            onClick={() => onSelect(photoIndex)}
            className={cn(
              "relative overflow-hidden rounded-md p-0 ring-offset-2 transition-[opacity,box-shadow,transform] hover:bg-transparent",
              fill
                ? "aspect-[4/3] h-auto min-w-14 flex-1 md:h-auto"
                : "h-14 w-20 shrink-0 md:h-14 md:w-20",
              tone === "inverted" ? "ring-offset-black" : "ring-offset-card",
              isCurrent
                ? cn(
                    "ring-2",
                    tone === "inverted" ? "ring-white" : "ring-primary",
                  )
                : "opacity-75 hover:opacity-100",
            )}
          >
            <SecureImage file={photo.file} alt="" />
          </Button>
        );
      })}
    </Box>
  );
}
