import { LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { CatalogCard, CatalogCardSkeleton } from "@/components/molecules/catalog-card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { CatalogItemDialog } from "@/components/organisms/catalog-item-dialog";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { useCatalog } from "@/hooks/api/gestao/catalog/useCatalog";
import { useCatalogWrites } from "@/hooks/api/gestao/catalog/useCatalogWrites";
import type { CatalogFleet, CatalogItem } from "@/types/catalog";
import { pluralize } from "@/utils/text";

type DialogState =
  | { open: false }
  | { open: true; item?: CatalogItem; preset?: { modelId: string; year: number } };

/** Model + year in the fleet still out of the catalogue: one tap adds it. */
function MissingCard({ missing, onAdd }: { missing: CatalogFleet[]; onAdd: (fleet: CatalogFleet) => void }) {
  if (!missing.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Na frota, fora do catálogo</CardTitle>
      </CardHeader>
      <CardContent>
        <List className="divide-y">
          {missing.map((fleet) => (
            <ListItem
              key={`${fleet.modelId}:${fleet.year}`}
              className="flex items-center justify-between gap-3 py-2"
            >
              <Box className="min-w-0">
                <Text weight="medium" truncate>
                  {fleet.brandName} {fleet.modelName} {fleet.year}
                </Text>
                <Text size="xs" tone="muted">
                  {pluralize(fleet.units, "unidade", "unidades")}
                  {fleet.vehicleType ? ` · ${fleet.vehicleType}` : ""}
                </Text>
              </Box>
              <Button size="sm" variant="outline" onClick={() => onAdd(fleet)}>
                <Plus />
                Adicionar
              </Button>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

/** Vehicle catalogue: each model + year with its picture, apart from the fleet. */
export function VehicleCatalogPage() {
  const catalog = useCatalog();
  const { remove } = useCatalogWrites();
  const [dialog, setDialog] = useState<DialogState>({ open: false });

  return (
    <Box className="space-y-6">
      <PageHeader
        title="Catálogo"
        actions={
          <Button onClick={() => setDialog({ open: true })}>
            <Plus />
            Novo item
          </Button>
        }
      />
      <QueryBoundary
        query={catalog}
        label="Carregando o catálogo"
        skeleton={<CatalogSkeleton />}
      >
        {({ items, missing }) => (
          <Box className="space-y-6">
            {items.length ? (
              <Row className="gap-y-4">
                {items.map((item) => (
                  <Col key={item.id} sm={6} lg={4} xl={3}>
                    <CatalogCard
                      item={item}
                      actions={
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDialog({ open: true, item })}
                          >
                            Editar
                          </Button>
                          <ConfirmDialog
                            trigger={
                              <Button size="sm" variant="ghost">
                                Excluir
                              </Button>
                            }
                            title={`Tirar ${item.modelName} ${item.year} do catálogo?`}
                            description="Os veículos da frota não mudam: sai só o item do catálogo e a imagem enviada."
                            confirmLabel="Excluir"
                            destructive
                            isPending={remove.isPending}
                            onConfirm={() => remove.mutate(item.id)}
                          />
                        </>
                      }
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <EmptyState
                icon={LayoutGrid}
                title="Catálogo vazio"
                description="Cadastre cada modelo e ano com a imagem dele. As cores e as unidades vêm da frota."
              />
            )}
            <MissingCard
              missing={missing}
              onAdd={(fleet) =>
                setDialog({ open: true, preset: { modelId: fleet.modelId, year: fleet.year } })
              }
            />
          </Box>
        )}
      </QueryBoundary>
      <CatalogItemDialog
        open={dialog.open}
        onOpenChange={(open) => !open && setDialog({ open: false })}
        item={dialog.open ? dialog.item : null}
        preset={dialog.open ? dialog.preset : null}
      />
    </Box>
  );
}

function CatalogSkeleton() {
  return (
    <Row className="gap-y-4">
      {[0, 1, 2, 3].map((index) => (
        <Col key={index} sm={6} lg={4} xl={3}>
          <CatalogCardSkeleton />
        </Col>
      ))}
    </Row>
  );
}
