import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

export function Spinner({ className, ...props }: ComponentProps<"svg">) {
  return (
    <LoaderCircle
      role="status"
      aria-label="Carregando"
      className={cn("size-5 animate-spin text-muted-foreground", className)}
      {...props}
    />
  );
}
