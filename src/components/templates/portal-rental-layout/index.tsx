import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";

type PortalRentalLayoutProps = {
  summary: ReactNode;
  caution: ReactNode;
  sections: ReactNode;
};

/** One column, like the rest of the portal: the rental, then what it holds. */
export function PortalRentalLayout({
  summary,
  caution,
  sections,
}: PortalRentalLayoutProps) {
  return (
    <Box className="space-y-6">
      {summary}
      {caution}
      {sections}
    </Box>
  );
}
