import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { InfoItem } from "@/components/molecules/info-item";
import type { ActiveRental } from "@/types/vehicle";

export function VehicleRentalCard({ rental }: { rental: ActiveRental | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Locação</CardTitle>
      </CardHeader>
      <CardContent>
        {rental ? (
          <dl className="grid grid-cols-2 gap-4">
            <InfoItem label="Locatário">{rental.customer.name}</InfoItem>
            <InfoItem label="Código" mono>
              {rental.code}
            </InfoItem>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma locação ativa neste veículo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
