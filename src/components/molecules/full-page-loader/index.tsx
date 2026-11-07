import { Box } from "@/components/atoms/box";
import { Spinner } from "@/components/atoms/spinner";
import { Logo } from "@/components/molecules/logo";

export function FullPageLoader() {
  return (
    <Box className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <Logo />
      <Spinner />
    </Box>
  );
}
