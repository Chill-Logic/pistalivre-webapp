import { ArrowRight, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/atoms/description-list";
import { Text } from "@/components/atoms/text";
import type { SearchDetail } from "@/types/search";

type SearchPreviewProps = {
  icon: LucideIcon;
  kind: string;
  title: string;
  subtitle?: string | null;
  details?: SearchDetail[];
  /** Long text (a manual section), line by line. */
  text?: string | null;
  actionLabel?: string;
  onAction?: () => void;
};

/** The summary of the chosen result, beside the list (desktop) or in place of it (manual on mobile). */
export function SearchPreview({
  icon: Icon,
  kind,
  title,
  subtitle,
  details = [],
  text,
  actionLabel,
  onAction,
}: SearchPreviewProps) {
  return (
    <Box className="flex h-full min-h-0 flex-col gap-4">
      <Box className="flex items-start gap-3">
        <Box className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </Box>
        <Box className="min-w-0 flex-1 space-y-1">
          <Badge variant="outline">{kind}</Badge>
          <Text size="base" weight="semibold" className="break-words leading-snug">
            {title}
          </Text>
          {subtitle && (
            <Text size="xs" tone="muted" className="break-words">
              {subtitle}
            </Text>
          )}
        </Box>
      </Box>
      {details.length > 0 && (
        <DescriptionList className="space-y-2.5">
          {details.map((d) => (
            <Box key={d.label}>
              <DescriptionTerm>{d.label}</DescriptionTerm>
              <DescriptionDetails>{d.value}</DescriptionDetails>
            </Box>
          ))}
        </DescriptionList>
      )}
      {text && (
        <Box className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {text.split("\n").map((line, i) => (
            <Text key={i} className="leading-relaxed">
              {line}
            </Text>
          ))}
        </Box>
      )}
      {actionLabel && onAction && (
        <Box className="mt-auto pt-2">
          <Button onClick={onAction} className="w-full">
            {actionLabel}
            <ArrowRight />
          </Button>
        </Box>
      )}
    </Box>
  );
}
