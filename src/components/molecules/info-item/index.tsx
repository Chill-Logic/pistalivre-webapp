import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import {
  DescriptionDetails,
  DescriptionTerm,
} from "@/components/atoms/description-list";
import { cn } from "@/utils/cn";

type InfoItemProps = {
  label: string;
  children: ReactNode;
  mono?: boolean;
};

/** Label/value pair; use inside a DescriptionList. */
export function InfoItem({ label, children, mono = false }: InfoItemProps) {
  return (
    <Box className="min-w-0 space-y-1">
      <DescriptionTerm>{label}</DescriptionTerm>
      <DescriptionDetails className={cn(mono && "font-mono")}>
        {children ?? "—"}
      </DescriptionDetails>
    </Box>
  );
}
