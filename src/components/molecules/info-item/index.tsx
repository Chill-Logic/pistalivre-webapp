import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type InfoItemProps = {
  label: string;
  children: ReactNode;
  mono?: boolean;
};

/** Label/value pair; use inside a <dl>. */
export function InfoItem({ label, children, mono = false }: InfoItemProps) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("break-words text-sm", mono && "font-mono")}>
        {children ?? "—"}
      </dd>
    </div>
  );
}
