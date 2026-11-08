import { Copy } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Row } from "@/components/atoms/grid";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { LABEL_MAPS } from "@/constants/label-maps";
import { rateLabel } from "@/helpers/rental";
import { useCopy } from "@/hooks/ui/useCopy";
import { useLabels } from "@/hooks/ui/useLabels";
import type { LeadDetail } from "@/types/crm";
import { formatDate, formatDateTime } from "@/utils/format";

/**
 * What the lead answered on their own (public questionnaire): qualification,
 * the plan they liked, and where the questionnaire stands. Hidden when the
 * lead never got there.
 */
export function LeadJourneyCard({ lead }: { lead: LeadDetail }) {
  const { label } = useLabels();
  const copy = useCopy();
  const { qualification, interestedPlan, questionnaire } = lead;
  if (!qualification && !interestedPlan && !questionnaire) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Questionário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row as="dl" className="gap-y-4">
          {qualification && (
            <>
              <InfoItem label="Apps em que trabalha">
                {qualification.workApps.length > 0
                  ? qualification.workApps.join(", ")
                  : null}
              </InfoItem>
              <InfoItem span={6} label="Tempo de app">
                {qualification.appsExperienceLabel}
              </InfoItem>
              <InfoItem span={6} label="Renda">
                {qualification.incomeTypeLabel}
              </InfoItem>
              <InfoItem label="Quer ter veículo próprio">
                {qualification.wantsOwnVehicle == null
                  ? null
                  : qualification.wantsOwnVehicle
                    ? "Sim"
                    : "Não"}
              </InfoItem>
              {qualification.qualifiedAt && (
                <InfoItem label="Respondido em">
                  {formatDateTime(qualification.qualifiedAt)}
                </InfoItem>
              )}
            </>
          )}
          {interestedPlan && (
            <InfoItem label="Plano de interesse">
              {interestedPlan.name} ·{" "}
              {rateLabel(
                interestedPlan.rate,
                label(LABEL_MAPS.ratePeriod, interestedPlan.ratePeriod),
              )}
              {interestedPlan.durationMonths &&
                ` · ${interestedPlan.durationMonths} meses`}
            </InfoItem>
          )}
          {questionnaire && (
            <InfoItem label="Situação">
              {questionnaire.submittedAt
                ? `Enviado em ${formatDate(questionnaire.submittedAt)}`
                : questionnaire.expired
                  ? "Link expirado"
                  : `Em andamento · válido até ${formatDate(questionnaire.expiresAt)}`}
            </InfoItem>
          )}
        </Row>
        {questionnaire?.link && (
          <Box className="flex flex-wrap items-center gap-2">
            <Text
              size="xs"
              tone="muted"
              mono
              className="min-w-0 flex-1 truncate"
            >
              {questionnaire.link}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(questionnaire.link ?? "", "Link copiado")}
            >
              <Copy />
              Copiar link
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
