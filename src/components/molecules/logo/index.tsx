import { Box } from "@/components/atoms/box";
import { Image } from "@/components/atoms/image";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

type LogoProps = {
  className?: string;
  withName?: boolean;
};

export function Logo({ className, withName = true }: LogoProps) {
  return (
    <Box className={cn("inline-flex items-center gap-2", className)}>
      <Image src="/logo.svg" alt="" className="size-8" aria-hidden />
      {withName && (
        <Text inline size="lg" weight="bold" className="tracking-tight">
          Pista Livre
        </Text>
      )}
    </Box>
  );
}
