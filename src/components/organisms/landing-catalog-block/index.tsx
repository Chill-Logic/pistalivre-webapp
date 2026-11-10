import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { ExternalLink } from "@/components/atoms/external-link";
import { Card, CardContent } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { VehicleShowcase } from "@/components/molecules/vehicle-showcase";
import { CATALOG_NOT_FOUND, LEAD_CAPTURE_URL } from "@/constants/landing";
import { useCatalog } from "@/hooks/api/gestao/catalog/useCatalog";

export type LandingCatalogProps = {
  title: string;
  onlyAvailable: boolean;
  max: number;
  /** "1 disponível agora" on each card (off: the page shows the models only). */
  showAvailability?: boolean;
  /** "Não encontrou o que procurava?" under the cards (empty title hides it). */
  notFoundTitle?: string;
  notFoundText?: string;
  notFoundButton?: string;
};

/** The catalogue, live: active items, their cover and colours. */
export function LandingCatalogBlock({
  title,
  onlyAvailable,
  max,
  showAvailability = false,
  notFoundTitle = CATALOG_NOT_FOUND.title,
  notFoundText = CATALOG_NOT_FOUND.text,
  notFoundButton = CATALOG_NOT_FOUND.button,
}: LandingCatalogProps) {
  const catalog = useCatalog();
  const items = (catalog.data?.items ?? [])
    .filter((item) => item.active)
    .filter((item) => !onlyAvailable || (item.fleet?.available ?? 0) > 0)
    .slice(0, Math.max(1, max || 6));

  return (
    <Box className="mx-auto max-w-6xl space-y-6 px-4 py-12 md:px-10">
      <Heading level={2} className="text-center text-2xl md:text-3xl">
        {title}
      </Heading>
      <Row className="gap-y-4">
        {catalog.isPending
          ? [0, 1, 2].map((index) => (
              <Col key={index} sm={6} lg={4}>
                <Skeleton className="aspect-[4/3] rounded-xl" />
              </Col>
            ))
          : items.map((item) => (
              <Col key={item.id} sm={6} lg={4}>
                <Card className="h-full overflow-hidden">
                  <VehicleShowcase src={item.coverSrc} alt={`${item.brandName} ${item.modelName} ${item.year}`} />
                  <CardContent className="space-y-2 pt-4 md:pt-5">
                    <Box>
                      <Text size="xs" tone="muted">
                        {item.brandName}
                      </Text>
                      <Text size="base" weight="semibold">
                        {item.modelName} {item.year}
                      </Text>
                    </Box>
                    {item.variants.length > 0 && (
                      <Box className="flex gap-1.5" aria-label="Cores">
                        {item.variants.map((variant) => (
                          <Box
                            key={variant.id}
                            title={variant.color}
                            className="size-4 rounded-full border"
                            style={{ backgroundColor: variant.swatch ?? "transparent" }}
                          />
                        ))}
                      </Box>
                    )}
                    {showAvailability && (
                      <Text size="xs" tone={item.fleet?.available ? "success" : "muted"} weight="medium">
                        {item.fleet?.available
                          ? `${item.fleet.available} ${item.fleet.available === 1 ? "disponível" : "disponíveis"} agora`
                          : "Sob consulta"}
                      </Text>
                    )}
                  </CardContent>
                </Card>
              </Col>
            ))}
      </Row>
      {!catalog.isPending && !items.length && (
        <Text tone="muted" className="text-center">
          Nenhum veículo do catálogo para mostrar.
        </Text>
      )}
      {notFoundTitle.trim() && (
        // The lead form asks which vehicle: a suggestion feeds the demand map.
        <Box className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-8 text-center">
          <Heading level={3} className="text-lg md:text-xl">
            {notFoundTitle}
          </Heading>
          {notFoundText.trim() && (
            <Text tone="muted" size="base" className="max-w-xl">
              {notFoundText}
            </Text>
          )}
          <Button asChild variant="outline">
            <ExternalLink href={LEAD_CAPTURE_URL} className="text-foreground hover:no-underline">
              {notFoundButton}
            </ExternalLink>
          </Button>
        </Box>
      )}
    </Box>
  );
}
