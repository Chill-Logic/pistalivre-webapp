import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";

type VehicleDetailLayoutProps = {
  summary: ReactNode;
  rental: ReactNode;
  documents: ReactNode;
};

/** Grid shared by the detail page and its skeleton, so both line up. */
export function VehicleDetailLayout({
  summary,
  rental,
  documents,
}: VehicleDetailLayoutProps) {
  return (
    <Box className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
      {summary}
      {rental}
      <Box className="lg:col-span-2">{documents}</Box>
    </Box>
  );
}
