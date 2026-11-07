import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Box className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <Box className="space-y-1">
        <Heading>{title}</Heading>
        {description && <Text tone="muted">{description}</Text>}
      </Box>
      {actions && <Box className="flex gap-2">{actions}</Box>}
    </Box>
  );
}
