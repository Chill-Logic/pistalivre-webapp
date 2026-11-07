import { Camera, CheckSquare, Gauge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Heading } from "@/components/atoms/heading";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import type {
  InspectionRequirement,
  InspectionRequirements,
} from "@/types/template";

function RequirementGroup({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: LucideIcon;
  items: InspectionRequirement[];
}) {
  if (items.length === 0) return null;
  return (
    <Box className="space-y-2">
      <Box className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        <Heading level={3} variant="section">
          {title}
        </Heading>
      </Box>
      <List className="divide-y rounded-md border">
        {items.map((item) => (
          <ListItem
            key={item.id}
            className="flex items-center justify-between gap-3 px-3 py-2"
          >
            <Text>{item.label}</Text>
            {item.required ? (
              <Badge variant="neutral">Obrigatório</Badge>
            ) : (
              <Badge variant="outline">Opcional</Badge>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

/** What an inspection asks for, per vehicle type (mileage is built in). */
export function InspectionRequirementsCard({
  group,
}: {
  group: InspectionRequirements["types"][number];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{group.type.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RequirementGroup title="Fotos" icon={Camera} items={group.photos} />
        <RequirementGroup
          title="Leituras"
          icon={Gauge}
          items={group.readings}
        />
        <RequirementGroup
          title="Itens verificados"
          icon={CheckSquare}
          items={group.checks}
        />
        <Text size="xs" tone="muted">
          A quilometragem é pedida em toda vistoria.
        </Text>
      </CardContent>
    </Card>
  );
}

export function InspectionRequirementsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-20 text-base" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-9" />
        ))}
      </CardContent>
    </Card>
  );
}
