import { CarFront } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Image } from "@/components/atoms/image";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

type VehicleShowcaseProps = {
  src: string | null;
  alt: string;
  className?: string;
  /** Caption under the picture (e.g. the colour being previewed). */
  caption?: string;
};

/**
 * A vehicle picture on a soft stage: a short shadow follows the cut-out of a
 * transparent PNG (drop-shadow, not box-shadow) and a contact shadow under its
 * bottom edge grounds it.
 */
export function VehicleShowcase({ src, alt, className, caption }: VehicleShowcaseProps) {
  return (
    <Box
      className={cn(
        "relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-muted/20 via-muted/40 to-muted/70 p-4",
        className,
      )}
    >
      {src ? (
        // The picture sits on the box's bottom (the wheels of a cropped PNG) and
        // the contact shadow right there: the vehicle stands instead of floating.
        <Box className="relative flex h-[84%] w-[92%] items-end justify-center">
          <Box
            aria-hidden="true"
            className="absolute -bottom-[2%] left-1/2 h-[8%] w-[62%] -translate-x-1/2 rounded-[50%] bg-black/30 blur-[6px] dark:bg-black/70"
          />
          <Image
            src={src}
            alt={alt}
            loading="lazy"
            className="relative max-h-full max-w-full object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
          />
        </Box>
      ) : (
        <Box className="flex flex-col items-center gap-1 text-muted-foreground">
          <CarFront className="size-10" aria-hidden />
          <Text size="xs" tone="muted">
            Sem imagem
          </Text>
        </Box>
      )}
      {caption && (
        <Text size="xs" tone="muted" className="absolute bottom-2 left-3">
          {caption}
        </Text>
      )}
    </Box>
  );
}
