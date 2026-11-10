import { Plus, Tags } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { List, ListItem } from "@/components/atoms/list";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { CategoryDialog } from "@/components/organisms/category-dialog";
import { QueryBoundary } from "@/components/organisms/query-boundary";
import { useCategories } from "@/hooks/api/gestao/categories/useCategories";
import { useCategoryWrites } from "@/hooks/api/gestao/categories/useCategoryWrites";
import { useVehicleTypes } from "@/hooks/api/gestao/vehicles/useVehicleTypes";
import type { VehicleCategory } from "@/types/category";
import type { VehicleType } from "@/types/vehicle";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/text";

/** One category: its vehicles, rename and delete (only when empty). */
function CategoryRow({
  category,
  types,
}: {
  category: VehicleCategory;
  types: VehicleType[];
}) {
  const { remove } = useCategoryWrites();
  const inUse = category.vehicleCount > 0;
  return (
    <ListItem className="flex items-center justify-between gap-3 py-2">
      <Box className="min-w-0">
        <Text weight="medium" truncate>
          {category.name}
        </Text>
        <Text size="xs" tone="muted">
          {inUse
            ? pluralize(category.vehicleCount, "veículo", "veículos")
            : "Sem veículos"}
        </Text>
      </Box>
      <Box className="flex shrink-0 gap-1">
        <CategoryDialog
          types={types}
          category={category}
          trigger={
            <Button size="sm" variant="outline">
              Renomear
            </Button>
          }
        />
        {!inUse && (
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="ghost">
                Excluir
              </Button>
            }
            title={`Excluir a categoria ${category.name}?`}
            description="Ela não tem veículos. Para usá-la de novo, crie outra com o mesmo nome."
            confirmLabel="Excluir"
            destructive
            isPending={remove.isPending}
            onConfirm={() => remove.mutate(category.id)}
          />
        )}
      </Box>
    </ListItem>
  );
}

/**
 * Vehicle categories by type. The names should be the ESPÉCIE of the vehicle
 * document (Passageiro, Carga…): reading the CRLV picks the category by it.
 */
export function VehicleCategoriesPage() {
  const categories = useCategories();
  const types = useVehicleTypes();
  const typeList = types.data ?? [];

  return (
    <Box className="space-y-6">
      <PageHeader
        title="Categorias"
        actions={
          <CategoryDialog
            types={typeList}
            trigger={
              <Button disabled={!typeList.length}>
                <Plus />
                Nova categoria
              </Button>
            }
          />
        }
      />
      <QueryBoundary
        query={categories}
        label="Carregando as categorias"
        skeleton={<CategoriesSkeleton />}
      >
        {(list) =>
          typeList.length ? (
            <Row
              className={cn(
                "gap-y-4 transition-opacity",
                categories.isFetching && "opacity-60",
              )}
            >
              {typeList.map((type) => {
                const ofType = list.filter((c) => c.type.id === type.id);
                return (
                  <Col key={type.id} md={6} xl={4}>
                    <Card className="h-full">
                      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                        <CardTitle className="text-base">{type.name}</CardTitle>
                        <CategoryDialog
                          types={typeList}
                          typeId={type.id}
                          trigger={
                            <Button size="sm" variant="ghost">
                              <Plus />
                              Nova
                            </Button>
                          }
                        />
                      </CardHeader>
                      <CardContent>
                        {ofType.length ? (
                          <List className="divide-y">
                            {ofType.map((category) => (
                              <CategoryRow
                                key={category.id}
                                category={category}
                                types={typeList}
                              />
                            ))}
                          </List>
                        ) : (
                          <Text size="sm" tone="muted">
                            Nenhuma categoria de {type.name.toLowerCase()}.
                          </Text>
                        )}
                      </CardContent>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <EmptyState
              icon={Tags}
              title="Nenhum tipo de veículo"
              description="As categorias ficam dentro de um tipo (Carro, Moto…)."
            />
          )
        }
      </QueryBoundary>
    </Box>
  );
}

function CategoriesSkeleton() {
  return (
    <Row className="gap-y-4">
      {[0, 1, 2].map((card) => (
        <Col key={card} md={6} xl={4}>
          <Card className="h-full">
            <CardHeader>
              <Skeleton shape="text" className="w-24 text-base" />
            </CardHeader>
            <CardContent className="divide-y">
              {[0, 1, 2, 3].map((row) => (
                <Box key={row} className="flex items-center justify-between gap-3 py-2">
                  <Box className="space-y-1">
                    <Skeleton shape="text" className="w-28" />
                    <Skeleton shape="text" className="w-16 text-xs" />
                  </Box>
                  <Skeleton className="h-9 w-24 md:h-8" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
