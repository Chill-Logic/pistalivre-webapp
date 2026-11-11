import { Download, Maximize2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { PhotoCarousel } from "@/components/molecules/photo-carousel";
import { PhotoThumbnails } from "@/components/molecules/photo-thumbnails";
import { PhotoLightbox } from "@/components/organisms/photo-lightbox";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { GalleryPhoto } from "@/types/document";
import type { InspectionPhoto } from "@/types/inspection";
import { cn } from "@/utils/cn";
import { formatDate, formatFileSize } from "@/utils/format";

/**
 * Required photos in the requirement's order, as a gallery: swipe on the
 * phone (dots), previews under the photo on desktop, full screen on tap.
 */
export function InspectionPhotosCard({
  photos,
}: {
  photos: InspectionPhoto[];
}) {
  const { download } = useFileActions();
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const gallery = useMemo<GalleryPhoto[]>(
    () =>
      photos.map((photo) => ({
        key: photo.key,
        label: photo.label,
        file: photo.document,
      })),
    [photos],
  );
  const sent = photos.filter((photo) => photo.document).length;
  const current = photos[index];
  const isDownloading = (photo: GalleryPhoto | undefined) =>
    download.isPending &&
    Boolean(photo?.file) &&
    download.variables?.id === photo?.file?.id;

  function open(photoIndex: number) {
    setIndex(photoIndex);
    setIsFullscreen(true);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Fotos</CardTitle>
        {photos.length > 0 && (
          <Text size="xs" tone="muted" className="tabular-nums">
            {sent === photos.length
              ? `${sent} ${sent === 1 ? "foto" : "fotos"}`
              : `${sent} de ${photos.length} enviadas`}
          </Text>
        )}
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <Text tone="muted">Esta vistoria não pede fotos.</Text>
        ) : (
          <Box className="space-y-3">
            <PhotoCarousel
              photos={gallery}
              index={index}
              onIndexChange={setIndex}
              onOpen={open}
              className="aspect-[4/3] w-full"
            />
            <Box className="flex items-center gap-2">
              <Box className="min-w-0 flex-1">
                <Text weight="medium" truncate>
                  {current?.label}
                </Text>
                <Text size="xs" tone="muted" truncate>
                  {current?.document
                    ? [
                        formatFileSize(current.document.size),
                        formatDate(current.document.createdAt),
                      ].join(" · ")
                    : "Não enviada"}
                </Text>
              </Box>
              {current?.document && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Ampliar ${current.label}`}
                    onClick={() => open(index)}
                  >
                    <Maximize2 />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Baixar ${current.label}`}
                    disabled={isDownloading(gallery[index])}
                    onClick={() =>
                      current.document && download.mutate(current.document)
                    }
                  >
                    {isDownloading(gallery[index]) ? <Spinner /> : <Download />}
                  </Button>
                </>
              )}
            </Box>
            {photos.length > 1 && (
              <>
                <PhotoThumbnails
                  photos={gallery}
                  index={index}
                  onSelect={setIndex}
                  fill
                  className="-mx-1 hidden md:flex"
                />
                <Box
                  aria-hidden
                  className="flex justify-center gap-1.5 md:hidden"
                >
                  {gallery.map((photo, photoIndex) => (
                    <Box
                      key={photo.key}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        photoIndex === index
                          ? "w-5 bg-primary"
                          : "w-1.5 bg-muted-foreground/30",
                      )}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}
      </CardContent>
      <PhotoLightbox
        photos={gallery}
        index={index}
        onIndexChange={setIndex}
        open={isFullscreen}
        onOpenChange={setIsFullscreen}
        onDownload={(photo) => photo.file && download.mutate(photo.file)}
        isDownloading={isDownloading(gallery[index])}
      />
    </Card>
  );
}

const PREVIEW_COUNT = 6;

export function InspectionPhotosCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <Skeleton shape="text" className="w-16 text-base" />
        <Skeleton shape="text" className="w-12 text-xs" />
      </CardHeader>
      <CardContent>
        <Box className="space-y-3">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Box className="flex items-center gap-2">
            <Box className="min-w-0 flex-1 space-y-2">
              <Skeleton shape="text" className="w-1/3 text-sm" />
              <Skeleton shape="text" className="w-1/2 text-xs" />
            </Box>
            <Skeleton className="size-9 shrink-0" />
            <Skeleton className="size-9 shrink-0" />
          </Box>
          <Box className="-mx-1 hidden gap-2 p-1 md:flex">
            {Array.from({ length: PREVIEW_COUNT }, (_, previewIndex) => (
              <Skeleton
                key={previewIndex}
                className="aspect-[4/3] min-w-14 flex-1 rounded-md"
              />
            ))}
          </Box>
          <Box className="flex justify-center gap-1.5 md:hidden">
            {Array.from({ length: PREVIEW_COUNT }, (_, dotIndex) => (
              <Skeleton
                key={dotIndex}
                className={cn("h-1.5 rounded-full", dotIndex ? "w-1.5" : "w-5")}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
