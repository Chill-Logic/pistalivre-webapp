import { useState, type ReactNode } from "react";
import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { VehicleShowcase } from "@/components/molecules/vehicle-showcase";
import type { CatalogItem } from "@/types/catalog";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/text";

/** One model + year of the catalogue: picture, text and what the fleet has. */
export function CatalogCard({ item, actions }: { item: CatalogItem; actions: ReactNode }) {
  const fleet = item.fleet;
  // A swatch shows that colour's picture; none picked = the cover.
  const [picked, setPicked] = useState<string | null>(null);
  const variant =
    item.variants.find((v) => v.id === picked) ?? item.variants.find((v) => v.isDefault) ?? null;
  const src = (picked ? variant?.imageSrc : null) ?? item.coverSrc;
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <VehicleShowcase src={src} alt={`${item.brandName} ${item.modelName} ${item.year}${variant ? ` ${variant.color}` : ""}`} />
      <CardContent className="flex flex-1 flex-col gap-3 pt-4 md:pt-5">
        <Box className="flex items-start justify-between gap-2">
          <Box className="min-w-0">
            <Text size="xs" tone="muted">
              {item.brandName}
            </Text>
            <Text weight="semibold" size="base">
              {item.modelName} {item.year}
            </Text>
          </Box>
          {!item.active && <Badge className="shrink-0">Inativo</Badge>}
        </Box>
        {item.description && (
          <Text tone="muted" className="line-clamp-2">
            {item.description}
          </Text>
        )}
        <Box className="mt-auto space-y-2">
          <Text size="xs" tone="muted">
            {fleet
              ? `${pluralize(fleet.units, "unidade", "unidades")} na frota · ${fleet.available} ${fleet.available === 1 ? "disponível" : "disponíveis"}`
              : "Nenhuma unidade na frota"}
          </Text>
          {item.variants.length > 0 && (
            <Box className="space-y-1">
              <Box className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cores">
                {item.variants.map((entry) => {
                  const active = entry.id === variant?.id;
                  return (
                    <Button
                      key={entry.id}
                      type="button"
                      variant="outline"
                      size="icon"
                      role="radio"
                      aria-checked={active}
                      aria-label={entry.color}
                      title={`Ver a foto: ${entry.color}`}
                      onClick={() => setPicked(entry.id)}
                      style={{ backgroundColor: entry.swatch ?? undefined }}
                      className={cn(
                        "h-6 w-6 rounded-full p-0 md:h-6 md:w-6",
                        active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      )}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
          {fleet && fleet.colors.length > 0 && (
            <List className="space-y-1" aria-label="Disponibilidade por cor">
              {fleet.colors.map((entry) => {
                const swatch = item.variants.find(
                  (v) => v.color.toLowerCase() === entry.color.toLowerCase(),
                )?.swatch;
                return (
                  // The name stays whole; the counts go below when narrow.
                  <ListItem key={entry.color} className="flex flex-wrap items-center gap-x-2">
                    <Box className="flex items-center gap-2">
                      <Box
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full border"
                        style={{ backgroundColor: swatch ?? "transparent" }}
                      />
                      <Text size="xs" weight="medium">
                        {entry.color}
                      </Text>
                    </Box>
                    <Text size="xs" tone="muted" className="ml-auto">
                      {pluralize(entry.units, "unidade", "unidades")} ·{" "}
                      <Text inline size="xs" tone={entry.available ? "success" : "muted"} weight={entry.available ? "medium" : "normal"}>
                        {entry.available} {entry.available === 1 ? "disponível" : "disponíveis"}
                      </Text>
                    </Text>
                  </ListItem>
                );
              })}
            </List>
          )}
          <Box className="flex gap-2 pt-1">{actions}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function CatalogCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <CardContent className="space-y-3 pt-4 md:pt-5">
        <Skeleton shape="text" className="w-20 text-xs" />
        <Skeleton shape="text" className="w-40 text-base" />
        <Skeleton shape="text" className="w-48 text-xs" />
        <Box className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </Box>
      </CardContent>
    </Card>
  );
}
