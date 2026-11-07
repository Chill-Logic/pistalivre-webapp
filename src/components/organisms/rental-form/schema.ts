import { z } from "zod";
import type {
  RatePeriod,
  RentalDetail,
  RentalInput,
  RentalStatus,
} from "@/types/rental";

const installmentSchema = z.object({
  key: z.string(),
  label: z.string().trim().min(1, "Descreva a parcela"),
  amount: z
    .number()
    .nullable()
    .refine((v) => v !== null && v > 0, "Informe o valor"),
  dueDate: z.string().min(1, "Informe o vencimento"),
});

export const rentalFormSchema = z
  .object({
    customerId: z.string().min(1, "Cliente é obrigatório"),
    customerLabel: z.string(),
    vehicleId: z.string().min(1, "Veículo é obrigatório"),
    vehicleLabel: z.string(),
    startDate: z.string().min(1, "Início é obrigatório"),
    endDate: z.string(),
    rate: z
      .number()
      .nullable()
      .refine((v) => v !== null && v > 0, "Valor deve ser maior que zero"),
    ratePeriod: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    paymentMethod: z.string(),
    paymentWeekday: z.string(),
    rentBillingTiming: z.enum(["CYCLE_START", "CYCLE_END"]),
    cautionType: z.enum(["", "FIXED", "WEEKLY", "INSTALLMENTS"]),
    cautionTotal: z.number().nullable(),
    cautionInstallmentValue: z.number().nullable(),
    cautionWeekday: z.string(),
    cautionInstallments: z.array(installmentSchema),
    notes: z.string().max(2000),
    status: z.string(),
    retroactive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.endDate && values.endDate < values.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Fim deve ser depois do início",
      });
    }
    if (
      values.cautionType &&
      !(values.cautionTotal && values.cautionTotal > 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["cautionTotal"],
        message: "Informe o valor da caução",
      });
    }
    if (values.cautionType === "WEEKLY") {
      if (!(
        values.cautionInstallmentValue && values.cautionInstallmentValue > 0
      )) {
        ctx.addIssue({
          code: "custom",
          path: ["cautionInstallmentValue"],
          message: "Informe a parcela semanal",
        });
      }
      if (!values.cautionWeekday) {
        ctx.addIssue({
          code: "custom",
          path: ["cautionWeekday"],
          message: "Escolha o dia da semana",
        });
      }
    }
    if (
      values.cautionType === "INSTALLMENTS" &&
      values.cautionInstallments.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["cautionInstallments"],
        message: "Adicione ao menos uma parcela",
      });
    }
  });

export type RentalFormValues = z.infer<typeof rentalFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const RENTAL_FORM_FIELDS = [
  "customerId",
  "vehicleId",
  "startDate",
  "endDate",
  "rate",
  "ratePeriod",
  "paymentMethod",
  "paymentWeekday",
  "rentBillingTiming",
  "cautionType",
  "cautionTotal",
  "cautionInstallmentValue",
  "cautionWeekday",
  "cautionInstallments",
  "notes",
  "status",
] as const;

let installmentSeq = 0;
/** Local key for an installment row (React list identity). */
export function newInstallmentKey() {
  installmentSeq += 1;
  return `row-${installmentSeq}`;
}

export function rentalFormDefaults(rental?: RentalDetail): RentalFormValues {
  const caution = rental?.caution;
  return {
    customerId: rental?.customer.id ?? "",
    customerLabel: rental?.customer.name ?? "",
    vehicleId: rental?.vehicle.id ?? "",
    vehicleLabel: rental
      ? `${rental.vehicle.plate} · ${rental.vehicle.brand.name} ${rental.vehicle.model.name}`
      : "",
    startDate: rental?.startDate.slice(0, 10) ?? "",
    endDate: rental?.endDate?.slice(0, 10) ?? "",
    rate: rental?.rate ?? null,
    ratePeriod: (rental?.ratePeriod ?? "WEEKLY") as RatePeriod,
    paymentMethod: rental?.paymentMethod ?? "",
    paymentWeekday:
      rental?.paymentWeekday != null ? String(rental.paymentWeekday) : "",
    rentBillingTiming: rental?.rentBillingTiming ?? "CYCLE_END",
    cautionType: caution?.type ?? "",
    cautionTotal: caution?.total ?? null,
    cautionInstallmentValue: caution?.installmentValue ?? null,
    cautionWeekday: caution?.weekday != null ? String(caution.weekday) : "",
    cautionInstallments: (caution?.installments ?? []).map((item) => ({
      key: newInstallmentKey(),
      label: item.label,
      amount: item.amount,
      dueDate: item.dueDate.slice(0, 10),
    })),
    notes: rental?.notes ?? "",
    status: "DRAFT",
    retroactive: false,
  };
}

const numberOrNull = (value: string) => (value === "" ? null : Number(value));

/** Form → API body. `isNew` adds status/source (create only). */
export function toRentalInput(
  values: RentalFormValues,
  isNew: boolean,
): RentalInput {
  const caution = values.cautionType || null;
  return {
    customerId: values.customerId,
    vehicleId: values.vehicleId,
    startDate: values.startDate,
    endDate: values.endDate || null,
    rate: values.rate ?? 0,
    ratePeriod: values.ratePeriod,
    paymentMethod: values.paymentMethod || null,
    // Only weekly rentals have a weekday; the others are anchored on dates.
    paymentWeekday:
      values.ratePeriod === "WEEKLY"
        ? numberOrNull(values.paymentWeekday)
        : null,
    rentBillingTiming: values.rentBillingTiming,
    cautionType: caution,
    cautionTotal: caution ? values.cautionTotal : null,
    cautionInstallmentValue:
      caution === "WEEKLY" ? values.cautionInstallmentValue : null,
    cautionWeekday:
      caution === "WEEKLY" ? numberOrNull(values.cautionWeekday) : null,
    cautionInstallments:
      caution === "INSTALLMENTS"
        ? values.cautionInstallments.map(({ label, amount, dueDate }) => ({
            label,
            amount: amount ?? 0,
            dueDate,
          }))
        : null,
    notes: values.notes.trim() || null,
    ...(isNew
      ? {
          status: values.status as RentalStatus,
          source: values.retroactive
            ? ("MANUAL" as const)
            : ("SYSTEM" as const),
        }
      : {}),
  };
}
