import { z } from "zod";
import type { DebtDetail, DebtInput, DebtLenderInput } from "@/types/debt";
import { calendarDay } from "@/utils/date";

const lenderSchema = z
  .object({
    type: z.enum(["CUSTOMER", "SUPPLIER", "USER", "OTHER"]),
    /** Our record's id (customer, supplier or user). */
    refId: z.string(),
    refLabel: z.string(),
    name: z.string().trim(),
  })
  .superRefine((lender, ctx) => {
    if (lender.type === "OTHER" && !lender.name) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Informe quem emprestou",
      });
    }
    if (lender.type !== "OTHER" && !lender.refId) {
      ctx.addIssue({
        code: "custom",
        path: ["refId"],
        message: "Escolha quem emprestou",
      });
    }
  });

/** Mirrors POST/PUT /debts (same PT messages as the management form). */
export const debtFormSchema = z
  .object({
    lenders: z.array(lenderSchema).min(1, "Informe quem emprestou"),
    kind: z.enum(["LOAN", "FINANCING", "OTHER"]),
    vehicleId: z.string(),
    vehicleLabel: z.string(),
    countsAsCost: z.boolean(),
    principal: z
      .number({ invalid_type_error: "Informe quanto pegamos" })
      .positive("Informe quanto pegamos"),
    interestPercent: z.string().trim(),
    interestPeriod: z.enum(["TOTAL", "MONTHLY", "YEARLY"]),
    interestMode: z.enum(["SIMPLE", "COMPOUND"]),
    interestBase: z.enum(["PRINCIPAL", "OUTSTANDING"]),
    borrowedAt: z.string().min(1, "Informe quando pegamos"),
    dueDate: z.string(),
    installments: z.string().refine((value) => {
      const n = Number(value);
      return Number.isInteger(n) && n >= 1 && n <= 360;
    }, "De 1 a 360 parcelas"),
    notes: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (Number(values.installments) > 1 && !values.dueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Informe a data da 1ª parcela",
      });
    }
    const percent = values.interestPercent.replace(",", ".");
    if (percent && (Number.isNaN(Number(percent)) || Number(percent) < 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["interestPercent"],
        message: "Percentual inválido",
      });
    }
  });

export type DebtFormValues = z.infer<typeof debtFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const DEBT_FORM_FIELDS = [
  "lenders",
  "kind",
  "vehicleId",
  "principal",
  "interestPercent",
  "interestPeriod",
  "interestMode",
  "interestBase",
  "borrowedAt",
  "dueDate",
  "installments",
  "notes",
] as const;

export function emptyLender(): DebtFormValues["lenders"][number] {
  return { type: "OTHER", refId: "", refLabel: "", name: "" };
}

export function debtFormDefaults(debt?: DebtDetail): DebtFormValues {
  if (!debt) {
    return {
      lenders: [emptyLender()],
      kind: "LOAN",
      vehicleId: "",
      vehicleLabel: "",
      countsAsCost: false,
      principal: 0,
      interestPercent: "",
      interestPeriod: "MONTHLY",
      interestMode: "SIMPLE",
      interestBase: "PRINCIPAL",
      borrowedAt: "",
      dueDate: "",
      installments: "1",
      notes: "",
    };
  }
  return {
    lenders: debt.lenders.map((lender) => ({
      type: lender.type,
      refId: lender.customerId ?? lender.supplierId ?? lender.userId ?? "",
      refLabel: lender.name,
      name: lender.type === "OTHER" ? lender.name : "",
    })),
    kind: debt.kind,
    vehicleId: debt.vehicle?.id ?? "",
    vehicleLabel: debt.vehicle
      ? `${debt.vehicle.plate} · ${debt.vehicle.label}`
      : "",
    countsAsCost: debt.countsAsCost,
    principal: debt.principal,
    interestPercent:
      debt.interestPercent != null ? String(debt.interestPercent) : "",
    interestPeriod: debt.interestPeriod,
    interestMode: debt.interestMode,
    interestBase: debt.interestBase,
    borrowedAt: calendarDay(debt.borrowedAt),
    dueDate: debt.dueDate ? calendarDay(debt.dueDate) : "",
    installments: String(debt.installments),
    notes: debt.notes ?? "",
  };
}

function toLender(lender: DebtFormValues["lenders"][number]): DebtLenderInput {
  switch (lender.type) {
    case "CUSTOMER":
      return { type: "CUSTOMER", customerId: lender.refId };
    case "SUPPLIER":
      return { type: "SUPPLIER", supplierId: lender.refId };
    case "USER":
      return { type: "USER", userId: lender.refId };
    default:
      return { type: "OTHER", name: lender.name };
  }
}

export function toDebtInput(values: DebtFormValues): DebtInput {
  const percent = values.interestPercent.replace(",", ".");
  return {
    lenders: values.lenders.map(toLender),
    kind: values.kind,
    vehicleId: values.vehicleId || null,
    countsAsCost: values.countsAsCost,
    principal: values.principal,
    interestPercent: percent ? Number(percent) : null,
    interestPeriod: values.interestPeriod,
    interestMode: values.interestMode,
    interestBase: values.interestBase,
    borrowedAt: values.borrowedAt,
    dueDate: values.dueDate || null,
    installments: Number(values.installments),
    notes: values.notes || null,
  };
}
