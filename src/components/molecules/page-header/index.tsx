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
    <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Heading>{title}</Heading>
      {actions && <Box className="flex gap-2">{actions}</Box>}
    </Box>
  );
}
