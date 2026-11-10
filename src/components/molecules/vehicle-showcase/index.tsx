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
 * A vehicle picture on a soft stage, with a short shadow that follows the
 * cut-out of a transparent PNG (drop-shadow, not box-shadow).
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
        // Only a shadow that follows the cut-out: it stays on the vehicle
        // whatever empty space the file has (a floor shadow tied to the
        // picture's edge floated under files with room below the wheels).
        <Image
          src={src}
          alt={alt}
          loading="lazy"
          className="max-h-[86%] max-w-[92%] object-contain drop-shadow-[0_3px_4px_rgba(0,0,0,0.25)]"
        />
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
