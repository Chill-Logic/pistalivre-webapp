import type { SlotComponent } from "@puckeditor/core";
import { Col, Row } from "@/components/atoms/grid";
import { cn } from "@/utils/cn";

export type LandingColumnsProps = {
  columns: 2 | 3 | 4;
  gap: "sm" | "md" | "lg";
  align: "start" | "center";
  col1: SlotComponent;
  col2: SlotComponent;
  col3: SlotComponent;
  col4: SlotComponent;
};

const SPAN = { 2: 6, 3: 4, 4: 3 } as const;
const GAP = { sm: "gap-y-4", md: "gap-y-6", lg: "gap-y-10" } as const;

/** Side-by-side columns (stacked on the phone), each one taking blocks. */
export function LandingColumnsBlock({ columns, gap, align, col1, col2, col3, col4 }: LandingColumnsProps) {
  const slots = [col1, col2, col3, col4].slice(0, columns);
  return (
    <Row className={cn(GAP[gap], align === "center" && "items-center")}>
      {slots.map((Slot, index) => (
        <Col key={index} md={columns === 4 ? 6 : SPAN[columns]} lg={SPAN[columns]}>
          <Slot className="flex h-full flex-col gap-4" minEmptyHeight={80} />
        </Col>
      ))}
    </Row>
  );
}
