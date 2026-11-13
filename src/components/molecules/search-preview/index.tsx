import { ArrowRight, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  DescriptionDetails,
  DescriptionTerm,
} from "@/components/atoms/description-list";
import { Col, Row } from "@/components/atoms/grid";
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

/**
 * The summary of the chosen result, beside the list (desktop) or in place of
 * it (manual on mobile). Details in two columns so a charge fits without
 * scrolling; when something is long, only the content scrolls (quietly) and
 * the button stays at the bottom, in reach.
 */
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
    <Box className="flex h-full min-h-0 flex-col">
      <Box className="scrollbar-quiet -mr-2 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
        <Box className="flex items-start gap-3">
          <Box className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden />
          </Box>
          <Box className="min-w-0 flex-1 space-y-1">
            <Badge variant="outline">{kind}</Badge>
            <Text
              size="base"
              weight="semibold"
              className="break-words leading-snug"
            >
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
          <Row as="dl" className="gap-y-3">
            {details.map((d) => (
              <Col key={d.label} span={6}>
                <DescriptionTerm>{d.label}</DescriptionTerm>
                <DescriptionDetails>{d.value}</DescriptionDetails>
              </Col>
            ))}
          </Row>
        )}
        {text && (
          <Box className="space-y-2">
            {text.split("\n").map((line, i) => (
              <Text key={i} className="leading-relaxed">
                {line}
              </Text>
            ))}
          </Box>
        )}
      </Box>
      {actionLabel && onAction && (
        <Box className="shrink-0 pt-4">
          <Button onClick={onAction} className="w-full">
            {actionLabel}
            <ArrowRight />
          </Button>
        </Box>
      )}
    </Box>
  );
}
