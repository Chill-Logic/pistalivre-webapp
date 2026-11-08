import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { PortalRentalCard } from "@/components/molecules/portal-rental-card";
import type { PortalRental } from "@/types/portal";

/** A titled group of the renter's rentals (current, history), side by side from md up. */
export function PortalRentalGroup({
  title,
  rentals,
  empty,
}: {
  title: string;
  rentals: PortalRental[];
  /** Shown when the group has no rental. */
  empty?: ReactNode;
}) {
  return (
    <Box className="space-y-3">
      <Heading level={2} variant="section">
        {title}
      </Heading>
      {rentals.length === 0 ? (
        <Text tone="muted">{empty}</Text>
      ) : (
        <Row as="ul" className="gap-y-4">
          {rentals.map((rental) => (
            <Col as="li" md={6} key={rental.id}>
              <PortalRentalCard rental={rental} />
            </Col>
          ))}
        </Row>
      )}
    </Box>
  );
}
