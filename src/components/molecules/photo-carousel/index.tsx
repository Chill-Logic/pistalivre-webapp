import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { SecureImage } from "@/components/molecules/secure-image";
import type { GalleryPhoto } from "@/types/document";
import { cn } from "@/utils/cn";

type PhotoCarouselProps = {
  photos: GalleryPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  /** Tap on a sent photo (opens the full screen). */
  onOpen?: (index: number) => void;
  /** `card`: rounded, photo fills; `fullscreen`: dark, whole photo. */
  variant?: "card" | "fullscreen";
  /** Focus the track on mount (full screen: keys work at once). */
  autoFocus?: boolean;
  className?: string;
};

/** Settles the index only after the swipe stops (no jitter mid-scroll). */
const SCROLL_SETTLE_MS = 120;
/** How long a glide we started (arrow, key, preview) may take. */
const GLIDE_MAX_MS = 800;

/**
 * Swipeable carousel (CSS scroll snap: native feel on touch), with arrows
 * on desktop and ←/→ on the keyboard.
 */
export function PhotoCarousel({
  photos,
  index,
  onIndexChange,
  onOpen,
  variant = "card",
  autoFocus = false,
  className,
}: PhotoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const hasScrolled = useRef(false);
  /** Where our own glide is heading: scroll positions on the way are not
   *  the user's choice, so they must not change the index. */
  const glide = useRef<{ target: number; until: number } | null>(null);
  const isFullscreen = variant === "fullscreen";
  const last = photos.length - 1;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const left = index * track.clientWidth;
    if (Math.abs(track.scrollLeft - left) < 2) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // First positioning (opening on photo 4) jumps; later moves glide.
    const smooth = hasScrolled.current && !reduceMotion;
    glide.current = { target: index, until: Date.now() + GLIDE_MAX_MS };
    track.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    hasScrolled.current = true;
  }, [index]);

  const indexRef = useRef(index);
  indexRef.current = index;

  // A resize (phone turned, window narrowed) keeps the same photo in view.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(() => {
      const left = indexRef.current * track.clientWidth;
      if (Math.abs(track.scrollLeft - left) < 2) return;
      glide.current = {
        target: indexRef.current,
        until: Date.now() + GLIDE_MAX_MS,
      };
      track.scrollTo({ left, behavior: "auto" });
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (autoFocus) trackRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  function settle() {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const next = Math.min(
      Math.max(Math.round(track.scrollLeft / track.clientWidth), 0),
      last,
    );
    hasScrolled.current = true;
    const ours = glide.current;
    if (ours && next !== ours.target && Date.now() < ours.until) {
      // Still on the way (or the person swiped mid-glide): look again
      // once the glide is over.
      settleTimer.current = window.setTimeout(settle, ours.until - Date.now());
      return;
    }
    glide.current = null;
    if (next !== indexRef.current) onIndexChange(next);
  }

  function handleScroll() {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(settle, SCROLL_SETTLE_MS);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      onIndexChange(index - 1);
    }
    if (event.key === "ArrowRight" && index < last) {
      event.preventDefault();
      onIndexChange(index + 1);
    }
  }

  const arrowClass = cn(
    "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full shadow-md transition-opacity md:inline-flex",
    isFullscreen
      ? "bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
      : "bg-background/80 opacity-0 backdrop-blur group-hover:opacity-100 group-focus-within:opacity-100",
  );

  return (
    <Box
      className={cn("group relative", className)}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Fotos"
    >
      <Box
        ref={trackRef}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          !isFullscreen &&
            "rounded-lg bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        )}
      >
        {photos.map((photo, photoIndex) => (
          <Box
            key={photo.key}
            role="group"
            aria-roledescription="foto"
            aria-label={`${photoIndex + 1} de ${photos.length}: ${photo.label}`}
            className="relative size-full shrink-0 snap-center snap-always"
          >
            {photo.file && onOpen ? (
              <Button
                type="button"
                variant="ghost"
                tabIndex={-1}
                aria-label={`Ampliar ${photo.label}`}
                onClick={() => onOpen(photoIndex)}
                className="size-full cursor-zoom-in rounded-none p-0 hover:bg-transparent active:scale-100 md:size-full"
              >
                <SecureImage
                  file={photo.file}
                  alt={photo.label}
                  fit={isFullscreen ? "contain" : "cover"}
                  emptyLabel="Não enviada"
                />
              </Button>
            ) : (
              <SecureImage
                file={photo.file}
                alt={photo.label}
                fit={isFullscreen ? "contain" : "cover"}
                emptyLabel="Não enviada"
                className={cn(isFullscreen && "bg-transparent text-white/60")}
              />
            )}
            {!isFullscreen && (
              <Box className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2.5 pt-10 text-white">
                <Text weight="medium" truncate className="text-white">
                  {photo.label}
                </Text>
                <Text
                  size="xs"
                  className="shrink-0 rounded-full bg-black/40 px-2 py-0.5 tabular-nums text-white"
                >
                  {photoIndex + 1}/{photos.length}
                </Text>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {photos.length > 1 && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Foto anterior"
            disabled={index === 0}
            onClick={() => onIndexChange(index - 1)}
            className={cn(arrowClass, "left-3 disabled:opacity-0")}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Próxima foto"
            disabled={index === last}
            onClick={() => onIndexChange(index + 1)}
            className={cn(arrowClass, "right-3 disabled:opacity-0")}
          >
            <ChevronRight />
          </Button>
        </>
      )}
    </Box>
  );
}
