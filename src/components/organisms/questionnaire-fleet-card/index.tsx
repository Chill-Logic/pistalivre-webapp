import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { formatMileage } from "@/utils/format";

type FleetItem = { label: string; mileage: number | null };

/** Units available today, with the real mileage ("com 11.000 km"). */
export function QuestionnaireFleetCard({ fleet }: { fleet: FleetItem[] }) {
  if (!fleet.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Disponíveis agora</CardTitle>
      </CardHeader>
      <CardContent>
        <List className="space-y-2">
          {fleet.map((item, index) => (
            <ListItem
              key={`${item.label}-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <Text>{item.label}</Text>
              <Text tone="muted" className="shrink-0">
                {item.mileage != null ? formatMileage(item.mileage) : "km sob consulta"}
              </Text>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
