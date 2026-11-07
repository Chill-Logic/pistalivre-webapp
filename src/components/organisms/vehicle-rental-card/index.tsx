import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Box } from "@/components/atoms/box";
import { DescriptionList } from "@/components/atoms/description-list";
import { Skeleton } from "@/components/atoms/skeleton";
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

export function VehicleRentalCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-20 text-base" />
      </CardHeader>
      <CardContent>
        <Box className="grid grid-cols-2 gap-4">
          {["w-32", "w-24"].map((width) => (
            <Box key={width} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className={`${width} text-sm`} />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
