import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { DescriptionList } from "@/components/atoms/description-list";
import { Text } from "@/components/atoms/text";
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
          <DescriptionList className="grid grid-cols-2 gap-4">
            <InfoItem label="Locatário">{rental.customer.name}</InfoItem>
            <InfoItem label="Código" mono>
              {rental.code}
            </InfoItem>
          </DescriptionList>
        ) : (
          <Text tone="muted">Nenhuma locação ativa neste veículo.</Text>
        )}
      </CardContent>
    </Card>
  );
}
