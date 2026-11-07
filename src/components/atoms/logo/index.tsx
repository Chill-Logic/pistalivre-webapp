import { cn } from "@/utils/cn";

type LogoProps = {
  className?: string;
  withName?: boolean;
};

export function Logo({ className, withName = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src="/logo.svg" alt="" className="size-8" aria-hidden />
      {withName && (
        <span className="text-lg font-bold tracking-tight">Pista Livre</span>
      )}
    </span>
  );
}
