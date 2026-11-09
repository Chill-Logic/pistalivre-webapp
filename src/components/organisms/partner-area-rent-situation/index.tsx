import { Col, Row } from "@/components/atoms/grid";
import { StatCard, StatCardSkeleton } from "@/components/molecules/stat-card";
import { PARTNER_TODAY_STATE } from "@/constants/partner-area";
import { cycleRangeText } from "@/helpers/partner-area";
import type {
  PartnerAreaSituation,
  PartnerAreaTodayState,
} from "@/types/partner-area";
import { formatCalendarDate, formatCurrency } from "@/utils/format";
import { pluralize } from "@/utils/text";

const TODAY_TONE: Record<
  PartnerAreaTodayState,
  "default" | "destructive" | "success"
> = {
  PAID: "success",
  PARTIAL: "destructive",
  OPEN: "destructive",
  UPCOMING: "default",
  WAIVED: "default",
  NONE: "default",
};

/**
 * How the rent stands today, exactly as the server computed it: today's
 * cycle, what is late, the last payment and the next due date.
 */
export function PartnerAreaRentSituation({
  situation,
  totalPaid,
}: {
  situation: PartnerAreaSituation;
  totalPaid: number;
}) {
  const today = situation.todayCycle;
  const range =
    today.start && today.end ? cycleRangeText(today.start, today.end) : null;
  const due = today.due ? formatCalendarDate(today.due) : null;
  const todayHint =
    today.state === "OPEN" || today.state === "PARTIAL"
      ? `Falta ${formatCurrency(today.missing)}${due ? ` · vence ${due}` : ""}`
      : today.state === "PAID"
        ? `${formatCurrency(today.paid)} pago${range ? ` · ${range}` : ""}`
        : today.state === "UPCOMING" && due
          ? `${formatCurrency(today.amount)} · vence ${due}`
          : range;
  const late = situation.daysLate > 0;

  return (
    <Row className="gap-y-4">
      <Col span={6}>
        <StatCard
          label="Aluguel de hoje"
          value={PARTNER_TODAY_STATE[today.state].label}
          tone={TODAY_TONE[today.state]}
          hint={todayHint}
        />
      </Col>
      <Col span={6}>
        <StatCard
          label="Em atraso"
          value={late ? formatCurrency(situation.overdueAmount) : "Em dia"}
          tone={late ? "destructive" : "success"}
          hint={
            late
              ? `${pluralize(situation.daysLate, "dia", "dias")} · ${pluralize(situation.lateCycles, "vencimento", "vencimentos")}${situation.lateSince ? ` desde ${formatCalendarDate(situation.lateSince)}` : ""}`
              : "Nenhum vencimento em aberto"
          }
        />
      </Col>
      <Col span={6}>
        <StatCard
          label="Último pagamento"
          value={
            situation.lastPayment
              ? formatCurrency(situation.lastPayment.amount)
              : "Nenhum"
          }
          tone={situation.lastPayment ? "default" : "muted"}
          hint={
            situation.lastPayment
              ? `Em ${formatCalendarDate(situation.lastPayment.at)} · ${formatCurrency(totalPaid)} no seu período`
              : "Nada pago no seu período"
          }
        />
      </Col>
      <Col span={6}>
        <StatCard
          label="Próximo vencimento"
          value={
            situation.nextDue ? formatCalendarDate(situation.nextDue) : "—"
          }
          tone={situation.nextDue ? "default" : "muted"}
          hint={situation.credit > 0 ? `Crédito de ${formatCurrency(situation.credit)}` : undefined}
        />
      </Col>
    </Row>
  );
}

export function PartnerAreaRentSituationSkeleton() {
  return (
    <Row className="gap-y-4">
      {[0, 1, 2, 3].map((index) => (
        <Col key={index} span={6}>
          <StatCardSkeleton />
        </Col>
      ))}
    </Row>
  );
}
