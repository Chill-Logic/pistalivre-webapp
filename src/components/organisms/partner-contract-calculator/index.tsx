import { Calculator, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/atoms/description-list";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { MoneyField } from "@/components/molecules/money-field";
import { SelectField } from "@/components/molecules/select-field";
import { LABEL_MAPS } from "@/constants/label-maps";
import { errorMessage } from "@/helpers/api-error";
import { usePartnerSimulation } from "@/hooks/api/gestao/partners/usePartnerSimulation";
import { useLabels } from "@/hooks/ui/useLabels";
import type {
  PartnerCostKey,
  PartnerCostPayerCode,
  PartnerSimulationInput,
} from "@/types/partner-simulation";
import type { RatePeriod } from "@/types/rental";
import { formatCurrency } from "@/utils/format";
import { parsePercentInput } from "@/utils/percent";
import { cn } from "@/utils/cn";

/** The contract terms the calculator follows (the form's values, as typed). */
export type CalculatorTerms = {
  type: "INVESTMENT" | "MANAGEMENT";
  shareBase: string;
  sharePercent: string;
  adminFeePercent: string;
  adminFeeFixed: number | null;
  payoutMode: "SHARE" | "FIXED";
  fixedPayout: number | null;
  maintenanceFeePercent: string;
  payoutFrequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  costs: Record<PartnerCostKey, PartnerCostPayerCode>;
};

/**
 * A scenario handed to the calculator from outside (the assistant read the
 * deal): each change of `key` applies it once; null fields keep what's there.
 */
export type CalculatorFill = {
  key: number;
  count: number | null;
  rate: number | null;
  period: RatePeriod | null;
  occupancy: number | null;
  costs: Partial<Record<PartnerCostKey, number | null>>;
};

type Group = {
  key: number;
  count: string;
  rate: number | null;
  period: RatePeriod;
};

const PERIOD_OPTIONS: { value: RatePeriod; label: string }[] = [
  { value: "DAILY", label: "Por dia" },
  { value: "WEEKLY", label: "Por semana" },
  { value: "MONTHLY", label: "Por mês" },
];

const COSTS: { key: PartnerCostKey; label: string; yearly?: boolean }[] = [
  { key: "maintenance", label: "Manutenção (mês)" },
  { key: "insurance", label: "Seguro (mês)" },
  { key: "tracker", label: "Rastreador (mês)" },
  { key: "taxes", label: "IPVA e taxas (ano)", yearly: true },
  { key: "fines", label: "Multas (mês)" },
];

const PAYOUT_LABEL = {
  WEEKLY: "semanal",
  BIWEEKLY: "quinzenal",
  MONTHLY: "mensal",
} as const;

let nextKey = 1;
const intOf = (text: string) => {
  const n = Number(text.replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/**
 * "Quanto o parceiro recebe?" beside the contract form: it follows the terms
 * as they're typed (type, base, %, fee, who pays each cost, payout) and the
 * simulation here (how many vehicles, at what rent, how much they're rented,
 * what each costs). Starts from the contract's vehicles when there are any.
 * The math is the server's; the result is a month's estimate.
 */
export function PartnerContractCalculator({
  terms,
  initialGroups,
  fill,
  className,
}: {
  terms: CalculatorTerms | null;
  /** The assistant's scenario ("Preencher na tela"): applied when its key changes. */
  fill?: CalculatorFill | null;
  /** The contract's vehicles, grouped by rent (editing): the starting point. */
  initialGroups?: { count: number; rate: number | null; period: RatePeriod }[];
  className?: string;
}) {
  const { label } = useLabels();
  const [groups, setGroups] = useState<Group[]>(() =>
    (initialGroups?.length
      ? initialGroups
      : [{ count: 1, rate: null, period: "WEEKLY" as RatePeriod }]
    ).map((g) => ({
      key: nextKey++,
      count: String(g.count),
      rate: g.rate,
      period: g.period,
    })),
  );
  const [occupancy, setOccupancy] = useState("100");
  const [costs, setCosts] = useState<Record<PartnerCostKey, number | null>>({
    maintenance: null,
    insurance: null,
    tracker: null,
    taxes: null,
    fines: null,
  });

  useEffect(() => {
    if (!fill) return;
    if (fill.count != null || fill.rate != null || fill.period != null) {
      setGroups((list) => {
        const first = list[0];
        return [
          {
            key: first?.key ?? nextKey++,
            count:
              fill.count != null ? String(fill.count) : (first?.count ?? "1"),
            rate: fill.rate ?? first?.rate ?? null,
            period: fill.period ?? first?.period ?? "WEEKLY",
          },
          ...list.slice(1),
        ];
      });
    }
    if (fill.occupancy != null) setOccupancy(String(fill.occupancy));
    setCosts((current) => {
      const next = { ...current };
      for (const [key, value] of Object.entries(fill.costs)) {
        if (value != null) next[key as PartnerCostKey] = value;
      }
      return next;
    });
    // Once per scenario (its key), not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fill?.key]);

  const patchGroup = (key: number, change: Partial<Group>) =>
    setGroups((list) =>
      list.map((g) => (g.key === key ? { ...g, ...change } : g)),
    );

  const input: PartnerSimulationInput | null = terms
    ? {
        type: terms.type,
        shareBase:
          terms.shareBase === "REVENUE" || terms.shareBase === "PROFIT"
            ? terms.shareBase
            : null,
        sharePercent: parsePercentInput(terms.sharePercent ?? "") ?? null,
        adminFeePercent: parsePercentInput(terms.adminFeePercent ?? "") ?? null,
        adminFeeFixed: terms.adminFeeFixed,
        payoutMode: terms.payoutMode ?? "SHARE",
        fixedPayout: terms.fixedPayout ?? null,
        maintenanceFeePercent:
          parsePercentInput(terms.maintenanceFeePercent ?? "") ?? null,
        payoutFrequency: terms.payoutFrequency,
        costs: terms.costs,
        vehicles: groups.map((g) => ({
          count: intOf(g.count),
          rate: g.rate ?? 0,
          ratePeriod: g.period,
        })),
        occupancyPercent: Math.min(100, intOf(occupancy)),
        monthlyCosts: {
          maintenance: costs.maintenance ?? 0,
          insurance: costs.insurance ?? 0,
          tracker: costs.tracker ?? 0,
          taxes: (costs.taxes ?? 0) / 12,
          fines: costs.fines ?? 0,
        },
      }
    : null;
  const validPercents =
    input !== null &&
    [
      input.sharePercent,
      input.adminFeePercent,
      input.maintenanceFeePercent,
    ].every((n) => n === null || (Number.isFinite(n) && n >= 0 && n <= 100));
  const simulation = usePartnerSimulation(validPercents ? input : null);
  const data = simulation.data;
  const isInvestment = terms?.type === "INVESTMENT";
  const profit = isInvestment && terms?.shareBase === "PROFIT";
  const fixedPayout = !isInvestment && terms?.payoutMode === "FIXED";
  const payer = (key: PartnerCostKey) =>
    terms ? label(LABEL_MAPS.partnerCostPayer, terms.costs[key]) : "";

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="size-4 text-primary" aria-hidden />
          Quanto o parceiro recebe?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Box className="space-y-3 border-b pb-4" aria-live="polite">
          <Box className="flex items-center justify-between">
            <Heading level={3} variant="section">
              Em um mês
            </Heading>
            {simulation.isFetching && <Spinner />}
          </Box>
          {!validPercents ? (
            <Text size="sm" tone="muted">
              Corrija o percentual para ver a conta.
            </Text>
          ) : simulation.isError && !data ? (
            <Alert>{errorMessage(simulation.error)}</Alert>
          ) : !data ? (
            <Text size="sm" tone="muted">
              Calculando…
            </Text>
          ) : (
            <Box
              className={cn("space-y-3", simulation.isFetching && "opacity-60")}
            >
              <DescriptionList className="space-y-1.5">
                <Line
                  term={`Aluguel recebido (${data.vehicleCount} motos)`}
                  value={data.revenue}
                />
                {data.costsByPayer.COMPANY > 0 && (
                  <Line
                    term="Despesas da empresa"
                    value={-data.costsByPayer.COMPANY}
                  />
                )}
                {data.costsByPayer.PARTNER > 0 && !fixedPayout && (
                  <Line
                    term="Despesas do parceiro"
                    value={-data.costsByPayer.PARTNER}
                  />
                )}
                {data.costsByPayer.RENTER > 0 && (
                  <Line
                    term="Por conta do locatário (fora da conta)"
                    value={data.costsByPayer.RENTER}
                    muted
                  />
                )}
                {isInvestment ? (
                  <Line
                    term={
                      profit
                        ? "Lucro (base da divisão)"
                        : "Base da divisão (faturamento)"
                    }
                    value={data.base}
                  />
                ) : fixedPayout ? (
                  <>
                    <Line
                      term="Repasse fixo (proporcional aos dias)"
                      value={data.partnerGross}
                    />
                    {data.maintenanceFee > 0 && (
                      <Line
                        term="Taxa de manutenção (sai do repasse)"
                        value={-data.maintenanceFee}
                      />
                    )}
                    {data.costsByPayer.PARTNER > 0 && (
                      <Line
                        term="Despesas do proprietário (saem do repasse)"
                        value={-data.costsByPayer.PARTNER}
                      />
                    )}
                  </>
                ) : (
                  <Line term="Taxa da empresa" value={data.adminFee} />
                )}
              </DescriptionList>
              <Box className="rounded-lg border-2 border-primary/50 bg-primary/5 p-3">
                <Text size="sm" tone="muted">
                  {isInvestment
                    ? "O investidor recebe"
                    : "O proprietário recebe"}
                </Text>
                <Text weight="semibold" className="text-2xl tabular-nums">
                  {formatCurrency(data.partnerNet)}
                  <Text inline size="sm" tone="muted" weight="normal">
                    {" "}
                    /mês
                  </Text>
                </Text>
                {terms && terms.payoutFrequency !== "MONTHLY" && (
                  <Text size="sm" tone="muted">
                    {formatCurrency(data.partnerPerPayout)} por repasse{" "}
                    {PAYOUT_LABEL[terms.payoutFrequency]}
                  </Text>
                )}
              </Box>
              <DescriptionList>
                <Line
                  term="Fica para a empresa"
                  value={data.companyNet}
                  strong
                />
              </DescriptionList>
              <Text size="xs" tone="muted">
                Estimativa de um mês: semana = 4,33 por mês; diária = 26 dias
                (domingo não cobra). O repasse de verdade segue o que os
                locatários pagarem.
              </Text>
            </Box>
          )}
        </Box>
        <Box className="space-y-3">
          <Heading level={3} variant="section">
            Veículos e aluguel
          </Heading>
          {groups.map((group) => (
            <Row key={group.key} className="items-end gap-y-2">
              <Col span={3}>
                <FormField
                  label="Motos"
                  inputMode="numeric"
                  value={group.count}
                  onChange={(event) =>
                    patchGroup(group.key, {
                      count: event.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </Col>
              <Col span={4}>
                <MoneyField
                  label="Aluguel"
                  value={group.rate}
                  onChange={(rate) => patchGroup(group.key, { rate })}
                />
              </Col>
              <Col span={groups.length > 1 ? 4 : 5}>
                <SelectField
                  label="Cobrado"
                  value={group.period}
                  options={PERIOD_OPTIONS}
                  onChange={(period) =>
                    patchGroup(group.key, { period: period as RatePeriod })
                  }
                />
              </Col>
              {groups.length > 1 && (
                <Col span={1} className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remover este grupo"
                    onClick={() =>
                      setGroups((list) =>
                        list.filter((g) => g.key !== group.key),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </Col>
              )}
            </Row>
          ))}
          <Row className="items-end gap-y-2">
            <Col span={6}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setGroups((list) => [
                    ...list,
                    {
                      key: nextKey++,
                      count: "1",
                      rate: null,
                      period: "WEEKLY",
                    },
                  ])
                }
              >
                <Plus />
                Outro valor de aluguel
              </Button>
            </Col>
            <Col span={6}>
              <FormField
                label="Ocupação (%)"
                inputMode="numeric"
                value={occupancy}
                onChange={(event) =>
                  setOccupancy(
                    event.target.value.replace(/\D/g, "").slice(0, 3),
                  )
                }
              />
            </Col>
          </Row>
        </Box>

        <Box className="space-y-3">
          <Heading level={3} variant="section">
            Despesas por moto
          </Heading>
          <Row className="gap-y-3">
            {COSTS.map((cost) => (
              <Col key={cost.key} span={6}>
                <MoneyField
                  label={cost.label}
                  value={costs[cost.key]}
                  onChange={(value) =>
                    setCosts((current) => ({ ...current, [cost.key]: value }))
                  }
                  hint={terms ? `Paga: ${payer(cost.key)}` : undefined}
                />
              </Col>
            ))}
          </Row>
        </Box>
      </CardContent>
    </Card>
  );
}

function Line({
  term,
  value,
  muted,
  strong,
}: {
  term: string;
  value: number;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <Box className="flex items-baseline justify-between gap-3">
      <DescriptionTerm className={cn(muted && "text-muted-foreground")}>
        {term}
      </DescriptionTerm>
      <DescriptionDetails
        className={cn(
          "tabular-nums",
          value < 0 && "text-muted-foreground",
          strong && "font-semibold",
          muted && "text-muted-foreground",
        )}
      >
        {formatCurrency(value)}
      </DescriptionDetails>
    </Box>
  );
}
