import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { Caution } from "@/types/rental";
import { formatCalendarDate, formatCurrency } from "@/utils/format";

export function RentalCautionCard({ caution }: { caution: Caution | null }) {
  const { label } = useLabels();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Caução</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!caution ? (
          <Text tone="muted">Sem caução nesta locação.</Text>
        ) : (
          <>
            <Row as="dl" className="gap-y-4">
              <InfoItem label="Tipo">
                {label(LABEL_MAPS.cautionType, caution.type)}
              </InfoItem>
              <InfoItem span={6} label="Total">
                {formatCurrency(caution.total)}
              </InfoItem>
              {caution.installmentValue !== null && (
                <InfoItem span={6} label="Parcela">
                  {formatCurrency(caution.installmentValue)}
                  {caution.weekday !== null &&
                    ` · ${label(LABEL_MAPS.weekday, caution.weekday)}`}
                </InfoItem>
              )}
            </Row>
            {caution.installments && caution.installments.length > 0 && (
              <List className="divide-y rounded-md border">
                {caution.installments.map((installment, index) => (
                  <ListItem
                    key={`${installment.dueDate}-${index}`}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <Box className="min-w-0">
                      <Text truncate>{installment.label}</Text>
                      <Text size="xs" tone="muted">
                        {formatCalendarDate(installment.dueDate)}
                      </Text>
                    </Box>
                    <Text weight="medium">
                      {formatCurrency(installment.amount)}
                    </Text>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function RentalCautionCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-20 text-base" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          <Col className="space-y-2">
            <Skeleton shape="text" className="w-12 text-xs" />
            <Skeleton shape="text" className="w-40 text-sm" />
          </Col>
          <Col span={6} className="space-y-2">
            <Skeleton shape="text" className="w-12 text-xs" />
            <Skeleton shape="text" className="w-20 text-sm" />
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}
