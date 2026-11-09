import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Text } from "@/components/atoms/text";

type PartnerAreaListRowProps = {
  title: ReactNode;
  /** Small lines under the title (dates, plate, km…). */
  meta?: ReactNode[];
  /** Right side: a value and/or a badge. */
  aside?: ReactNode;
  /** The row opens this page. */
  to?: string;
};

/** One row of a partner list, on the phone. */
export function PartnerAreaListRow({
  title,
  meta = [],
  aside,
  to,
}: PartnerAreaListRowProps) {
  const content = (
    <>
      <Box className="min-w-0 flex-1 space-y-1">
        <Text weight="medium">{title}</Text>
        {meta.filter(Boolean).map((line, index) => (
          <Text key={index} size="xs" tone="muted">
            {line}
          </Text>
        ))}
      </Box>
      {aside && (
        <Box className="flex shrink-0 flex-col items-end gap-1.5 text-right">
          {aside}
        </Box>
      )}
      {to && (
        <ChevronRight
          className="size-4 shrink-0 self-center text-muted-foreground"
          aria-hidden
        />
      )}
    </>
  );

  if (!to) return <Box className="flex items-start gap-3 py-3">{content}</Box>;
  return (
    <Link
      to={to}
      className="-mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-accent/50 active:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}
