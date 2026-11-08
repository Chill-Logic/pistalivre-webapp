import { Camera, CheckSquare, Gauge, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
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
import { InspectionRequirementDeleteButton } from "@/components/organisms/inspection-requirement-delete-button";
import { InspectionRequirementDialog } from "@/components/organisms/inspection-requirement-dialog";
import type {
  InspectionRequirement,
  InspectionRequirements,
} from "@/types/template";

function RequirementGroup({
  title,
  icon: Icon,
  items,
  typeName,
}: {
  title: string;
  icon: LucideIcon;
  items: InspectionRequirement[];
  typeName: string;
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
            className="flex items-center justify-between gap-2 py-1 pl-3 pr-1"
          >
            <Text className="min-w-0 flex-1 break-words">{item.label}</Text>
            {item.required ? (
              <Badge variant="neutral">Obrigatório</Badge>
            ) : (
              <Badge variant="outline">Opcional</Badge>
            )}
            <InspectionRequirementDeleteButton
              requirementId={item.id}
              label={item.label}
              typeName={typeName}
            />
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
  const isEmpty =
    group.photos.length + group.readings.length + group.checks.length === 0;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">{group.type.name}</CardTitle>
        <InspectionRequirementDialog
          vehicleType={group.type}
          trigger={
            <Button variant="outline" size="sm">
              <Plus />
              Adicionar item
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {isEmpty && (
          <Text tone="muted">Nenhum item configurado para este tipo.</Text>
        )}
        <RequirementGroup
          title="Fotos"
          icon={Camera}
          items={group.photos}
          typeName={group.type.name}
        />
        <RequirementGroup
          title="Leituras"
          icon={Gauge}
          items={group.readings}
          typeName={group.type.name}
        />
        <RequirementGroup
          title="Itens verificados"
          icon={CheckSquare}
          items={group.checks}
          typeName={group.type.name}
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
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <Skeleton shape="text" className="w-20 text-base" />
        <Skeleton className="h-9 w-36 md:h-8" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-10" />
        ))}
      </CardContent>
    </Card>
  );
}
