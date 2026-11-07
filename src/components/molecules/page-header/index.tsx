import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";

type PageHeaderProps = {
  title: string;
  actions?: ReactNode;
};

/** Page title only — no subtitle, by design (owner's call). */
export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <Box className="flex items-center justify-between gap-3">
      <Heading className="min-w-0">{title}</Heading>
      {actions && (
        <Box className="flex shrink-0 items-center gap-2">{actions}</Box>
      )}
    </Box>
  );
}
