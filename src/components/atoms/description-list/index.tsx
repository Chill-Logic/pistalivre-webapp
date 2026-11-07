import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

export function DescriptionList(props: ComponentProps<"dl">) {
  return <dl {...props} />;
}

export function DescriptionTerm({ className, ...props }: ComponentProps<"dt">) {
  return (
    <dt className={cn("text-xs text-muted-foreground", className)} {...props} />
  );
}

export function DescriptionDetails({
  className,
  ...props
}: ComponentProps<"dd">) {
  return <dd className={cn("break-words text-sm", className)} {...props} />;
}
