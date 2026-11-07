import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { EmptyState } from "@/components/molecules/empty-state";
import {
  RentalCard,
  RentalCardSkeleton,
} from "@/components/molecules/rental-card";
import type { RentalListItem } from "@/types/rental";

export function CustomerRentals({ rentals }: { rentals: RentalListItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Locações</CardTitle>
      </CardHeader>
      <CardContent>
        {rentals.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhuma locação" />
        ) : (
          <Row as="ul" className="gap-y-6">
            {rentals.map((rental) => (
              <Col as="li" key={rental.id} md={6}>
                <RentalCard rental={rental} />
              </Col>
            ))}
          </Row>
        )}
      </CardContent>
    </Card>
  );
}

export function CustomerRentalsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-24 text-base" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-6">
          <Col md={6}>
            <RentalCardSkeleton />
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}
