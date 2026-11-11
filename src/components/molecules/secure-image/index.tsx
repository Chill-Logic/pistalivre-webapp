import { ImageOff } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Image } from "@/components/atoms/image";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { useFileObjectUrl } from "@/hooks/api/comum/files/useFileObjectUrl";
import type { FileLink } from "@/types/document";
import { cn } from "@/utils/cn";

type SecureImageProps = {
  /** Null = nothing was sent (shows the placeholder). */
  file: FileLink | null;
  alt: string;
  /** `cover` fills the box (thumbnails); `contain` shows the whole photo. */
  fit?: "cover" | "contain";
  /** Text under the icon when there is no file (omit on tiny thumbnails). */
  emptyLabel?: string;
  className?: string;
};

/** Image from the API (authenticated), filling its parent box. */
export function SecureImage({
  file,
  alt,
  fit = "cover",
  emptyLabel,
  className,
}: SecureImageProps) {
  const image = useFileObjectUrl(file);

  if (file && image.isPending) {
    return <Skeleton className={cn("size-full rounded-none", className)} />;
  }

  if (!file || image.isError || !image.url) {
    return (
      <Box
        className={cn(
          "flex size-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="size-6" aria-hidden />
        {emptyLabel && (
          <Text size="xs" tone="muted">
            {file ? "Não foi possível carregar" : emptyLabel}
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Image
      src={image.url}
      alt={alt}
      draggable={false}
      className={cn(
        "size-full select-none animate-in fade-in-0 duration-300",
        fit === "cover" ? "object-cover" : "object-contain",
        className,
      )}
    />
  );
}
