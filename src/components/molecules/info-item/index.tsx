import type { ReactNode } from "react";
import {
  DescriptionDetails,
  DescriptionTerm,
} from "@/components/atoms/description-list";
import { Col } from "@/components/atoms/grid";
import type { ColSpans } from "@/helpers/grid";
import { cn } from "@/utils/cn";

type InfoItemProps = ColSpans & {
  label: string;
  children: ReactNode;
  mono?: boolean;
};

/** Label/value pair as a grid column; use inside `<Row as="dl">`. */
export function InfoItem({
  label,
  children,
  mono = false,
  ...spans
}: InfoItemProps) {
  return (
    <Col {...spans} className="space-y-1">
      <DescriptionTerm>{label}</DescriptionTerm>
      <DescriptionDetails className={cn(mono && "font-mono")}>
        {children ?? "—"}
      </DescriptionDetails>
    </Col>
  );
}
