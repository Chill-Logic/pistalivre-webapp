import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
      <Icon className="size-8 text-muted-foreground" aria-hidden />
      <Box className="space-y-1">
        <Text size="base" weight="medium">
          {title}
        </Text>
        {description && <Text tone="muted">{description}</Text>}
      </Box>
      {action}
    </Box>
  );
}
