import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Row } from "@/components/atoms/grid";
import { InfoItem } from "@/components/molecules/info-item";
import type { InspectionRequirements } from "@/types/template";
import { pluralize } from "@/utils/text";

/** How often inspections are due (the cadence policy). */
export function InspectionPolicyCard({
  policy,
}: {
  policy: InspectionRequirements["policy"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cadência</CardTitle>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem md={4} label="Vistoria completa">
            {policy.fullEveryDays
              ? `A cada ${pluralize(policy.fullEveryDays, "dia", "dias")}`
              : "Sem cadência"}
          </InfoItem>
          <InfoItem md={4} label="Leitura de km">
            {[
              policy.kmEveryDays &&
                `a cada ${pluralize(policy.kmEveryDays, "dia", "dias")}`,
              policy.kmEveryKm &&
                `a cada ${policy.kmEveryKm.toLocaleString("pt-BR")} km`,
            ]
              .filter(Boolean)
              .join(" ou ") || "Sem cadência"}
          </InfoItem>
          <InfoItem md={4} label="Km na manutenção">
            {policy.kmOnMaintenance ? "Pedido ao registrar" : "Não pedido"}
          </InfoItem>
        </Row>
      </CardContent>
    </Card>
  );
}
