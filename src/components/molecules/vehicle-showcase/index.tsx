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
 * A vehicle picture on a soft stage: the shadow follows the cut-out of a
 * transparent PNG (drop-shadow, not box-shadow) and a floor shadow grounds it.
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
        <>
          <Box
            aria-hidden="true"
            className="absolute bottom-[14%] left-1/2 h-[7%] w-3/5 -translate-x-1/2 rounded-[50%] bg-black/25 blur-md dark:bg-black/60"
          />
          <Image
            src={src}
            alt={alt}
            loading="lazy"
            className="relative max-h-[86%] max-w-[92%] object-contain drop-shadow-[0_14px_14px_rgba(0,0,0,0.28)]"
          />
        </>
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
