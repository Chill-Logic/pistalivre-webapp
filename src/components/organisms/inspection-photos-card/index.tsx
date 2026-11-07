import { ImageOff } from "lucide-react";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { DocumentItem } from "@/components/molecules/document-item";
import { useFileActions } from "@/hooks/api/comum/files/useFileActions";
import type { InspectionPhoto } from "@/types/inspection";

/** Required photos in the requirement's order; a missing one says so. */
export function InspectionPhotosCard({
  photos,
}: {
  photos: InspectionPhoto[];
}) {
  const { view, download } = useFileActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fotos</CardTitle>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <Text tone="muted">Esta vistoria não pede fotos.</Text>
        ) : (
          <Box className="divide-y">
            {photos.map((photo) =>
              photo.document ? (
                <DocumentItem
                  key={photo.key}
                  title={photo.label}
                  document={photo.document}
                  onView={() => photo.document && view.mutate(photo.document)}
                  onDownload={() =>
                    photo.document && download.mutate(photo.document)
                  }
                  isViewing={
                    view.isPending && view.variables?.id === photo.document.id
                  }
                  isDownloading={
                    download.isPending &&
                    download.variables?.id === photo.document.id
                  }
                />
              ) : (
                <Box key={photo.key} className="flex items-center gap-3 py-3">
                  <ImageOff
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <Box className="min-w-0 flex-1">
                    <Text weight="medium" truncate>
                      {photo.label}
                    </Text>
                    <Text size="xs" tone="muted">
                      Não enviada
                    </Text>
                  </Box>
                </Box>
              ),
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

const PHOTO_ROWS = 4;

export function InspectionPhotosCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-16 text-base" />
      </CardHeader>
      <CardContent>
        <Box className="divide-y">
          {Array.from({ length: PHOTO_ROWS }, (_, index) => (
            <Box key={index} className="flex items-center gap-3 py-3">
              <Skeleton className="size-5 shrink-0" />
              <Box className="min-w-0 flex-1 space-y-2">
                <Skeleton shape="text" className="w-1/3 text-sm" />
                <Skeleton shape="text" className="w-1/2 text-xs" />
              </Box>
              <Skeleton className="size-9 shrink-0" />
              <Skeleton className="size-9 shrink-0" />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
