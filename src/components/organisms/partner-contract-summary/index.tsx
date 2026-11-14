import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import {
  CostPayerList,
  CostPayerListSkeleton,
} from "@/components/molecules/cost-payer-list";
import { InfoItem } from "@/components/molecules/info-item";
import { PartnerContractStatusBadge } from "@/components/molecules/partner-contract-status-badge";
import { TextLink } from "@/components/molecules/text-link";
import { LABEL_MAPS } from "@/constants/label-maps";
import { routeTo } from "@/constants/routes";
import { contractTerms, payoutText } from "@/helpers/partner";
import { useLabels } from "@/hooks/ui/useLabels";
import type { PartnerContractDetail } from "@/types/partner";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { formatPercent } from "@/utils/percent";

/** The contract's terms as saved (money only shown, never computed). */
export function PartnerContractSummary({
  contract,
}: {
  contract: PartnerContractDetail;
}) {
  const { label } = useLabels();
  const isInvestment = contract.type === "INVESTMENT";
  const none = "Não informado";

  return (
    <Card>
      <CardHeader className="space-y-1">
        <Box className="flex flex-wrap items-center justify-between gap-2">
          <Heading className="min-w-0 uppercase tracking-[0.04em]">{contract.code}</Heading>
          <PartnerContractStatusBadge status={contract.status} />
        </Box>
        <Text tone="muted">
          {label(LABEL_MAPS.partnerContractType, contract.type)} ·{" "}
          {contractTerms(contract, (code) =>
            label(LABEL_MAPS.partnerShareBase, code),
          )}
        </Text>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem span={12} sm={6} lg={4} label="Parceiro">
            <TextLink to={routeTo.partner(contract.partner.id)}>
              {contract.partner.name}
            </TextLink>
          </InfoItem>
          {isInvestment ? (
            <>
              <InfoItem span={6} lg={4} label="Aporte">
                {contract.contributionType
                  ? label(
                      LABEL_MAPS.partnerContributionType,
                      contract.contributionType,
                    )
                  : none}
              </InfoItem>
              {contract.contributionType === "CASH" && (
                <InfoItem span={6} lg={4} label="Valor do aporte">
                  {contract.contributionAmount !== null
                    ? formatCurrency(contract.contributionAmount)
                    : none}
                  {contract.contributionDate &&
                    ` em ${formatCalendarDate(contract.contributionDate)}`}
                </InfoItem>
              )}
              <InfoItem span={6} lg={4} label="Parte do parceiro">
                {contract.sharePercent !== null
                  ? formatPercent(contract.sharePercent)
                  : none}
                {contract.shareBase &&
                  ` do ${label(LABEL_MAPS.partnerShareBase, contract.shareBase).toLowerCase()}`}
              </InfoItem>
            </>
          ) : contract.payoutMode === "FIXED" ? (
            <>
              <InfoItem span={6} lg={4} label="Repasse fixo por moto (mês)">
                {formatCurrency(contract.fixedPayout ?? 0)}
                {" · proporcional aos dias alugados"}
              </InfoItem>
              <InfoItem span={6} lg={4} label="Taxa de manutenção">
                {contract.maintenanceFeePercent !== null
                  ? `${formatPercent(contract.maintenanceFeePercent)} do repasse`
                  : "—"}
              </InfoItem>
            </>
          ) : (
            <>
              <InfoItem span={6} lg={4} label="Taxa da empresa (%)">
                {contract.adminFeePercent !== null
                  ? formatPercent(contract.adminFeePercent)
                  : "—"}
              </InfoItem>
              <InfoItem span={6} lg={4} label="Taxa fixa por mês">
                {contract.adminFeeFixed !== null
                  ? formatCurrency(contract.adminFeeFixed)
                  : "—"}
              </InfoItem>
            </>
          )}
          <InfoItem span={6} lg={4} label="Repasse (por fora)">
            {payoutText(contract, label)}
          </InfoItem>
          <InfoItem span={6} lg={4} label="Início">
            {formatCalendarDate(contract.startDate)}
          </InfoItem>
          <InfoItem span={6} lg={4} label="Fim">
            {contract.endDate
              ? formatCalendarDate(contract.endDate)
              : "Sem data"}
          </InfoItem>
          <InfoItem label="Quem paga">
            <CostPayerList costs={contract.costs} />
          </InfoItem>
          {contract.notes && (
            <InfoItem label="Observações">
              <Text inline size={null} className="whitespace-pre-line">
                {contract.notes}
              </Text>
            </InfoItem>
          )}
        </Row>
      </CardContent>
    </Card>
  );
}

export function PartnerContractSummarySkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton shape="text" className="w-48 text-2xl" />
        <Skeleton shape="text" className="w-64 text-sm" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Col key={index} span={6} lg={4} className="space-y-2">
              <Skeleton shape="text" className="w-16 text-xs" />
              <Skeleton shape="text" className="w-28 text-sm" />
            </Col>
          ))}
          <Col className="space-y-2">
            <Skeleton shape="text" className="w-16 text-xs" />
            <CostPayerListSkeleton />
          </Col>
        </Row>
      </CardContent>
    </Card>
  );
}
