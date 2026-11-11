import { Download, X } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFullscreenContent,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Spinner } from "@/components/atoms/spinner";
import { PhotoCarousel } from "@/components/molecules/photo-carousel";
import { PhotoThumbnails } from "@/components/molecules/photo-thumbnails";
import type { GalleryPhoto } from "@/types/document";

type PhotoLightboxProps = {
  photos: GalleryPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (photo: GalleryPhoto) => void;
  isDownloading: boolean;
};

/** Full screen viewer: swipe on the phone, arrows/keys and previews on desktop. */
export function PhotoLightbox({
  photos,
  index,
  onIndexChange,
  open,
  onOpenChange,
  onDownload,
  isDownloading,
}: PhotoLightboxProps) {
  const current = photos[index];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogFullscreenContent
        // The carousel takes the focus itself, so ←/→ work right away.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Box className="flex items-center gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Box className="min-w-0 flex-1">
            <DialogTitle className="truncate text-base text-white">
              {current?.label}
            </DialogTitle>
            <DialogDescription className="tabular-nums text-white/60">
              {index + 1} de {photos.length}
            </DialogDescription>
          </Box>
          {current?.file && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Baixar ${current.label}`}
              disabled={isDownloading}
              onClick={() => onDownload(current)}
              className="rounded-full text-white hover:bg-white/10 hover:text-white"
            >
              {isDownloading ? <Spinner /> : <Download />}
            </Button>
          )}
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar"
              className="rounded-full text-white hover:bg-white/10 hover:text-white"
            >
              <X />
            </Button>
          </DialogClose>
        </Box>
        <PhotoCarousel
          photos={photos}
          index={index}
          onIndexChange={onIndexChange}
          variant="fullscreen"
          autoFocus
          className="min-h-0 flex-1"
        />
        <Box className="flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          {photos.length > 1 && (
            <PhotoThumbnails
              photos={photos}
              index={index}
              onSelect={onIndexChange}
              tone="inverted"
              className="max-w-full"
            />
          )}
        </Box>
      </DialogFullscreenContent>
    </Dialog>
  );
}
