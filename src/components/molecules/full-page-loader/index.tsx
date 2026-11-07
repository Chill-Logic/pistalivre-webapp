import { Logo } from "@/components/atoms/logo";
import { Spinner } from "@/components/atoms/spinner";

export function FullPageLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <Logo />
      <Spinner />
    </div>
  );
}
