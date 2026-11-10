import { z } from "zod";
import { usesCard } from "@/helpers/payment-card";
import type { ExpensePaymentMethod } from "@/types/currency";
import type { SupplierDetail, SupplierInput } from "@/types/supplier";

/** Radix select reserves "": the "no value" entry of the optional selects. */
export const NONE = "__none__";

/** Mirrors the API's supplierSchema (same PT messages). */
export const supplierFormSchema = z
  .object({
    name: z.string().trim().min(1, "Nome é obrigatório").max(160),
    scope: z.enum(["COMPANY", "VEHICLE"], {
      errorMap: () => ({ message: "Escopo inválido" }),
    }),
    monthlyAmount: z
      .number({ invalid_type_error: "Informe o valor" })
      .nullable()
      .refine((value) => value !== null && value >= 0, "Informe o valor"),
    active: z.boolean(),
    billing: z.enum(["SINGLE", "PER_VEHICLE"]),
    /** "1".."31" or NONE. */
    dueDay: z.string(),
    /** "YYYY-MM" or NONE. */
    startsOn: z.string(),
    endsOn: z.string(),
    currency: z.enum(["BRL", "USD", "EUR"]),
    /** An ExpensePaymentMethod or NONE. */
    paymentMethod: z.string(),
    /** A card id or NONE (only by card). */
    paymentCardId: z.string(),
  })
  .refine(
    (s) => s.startsOn === NONE || s.endsOn === NONE || s.endsOn >= s.startsOn,
    { message: "O fim vem antes do começo", path: ["endsOn"] },
  );

export type SupplierFormInput = z.input<typeof supplierFormSchema>;
export type SupplierFormValues = z.output<typeof supplierFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const SUPPLIER_FORM_FIELDS = [
  "name",
  "scope",
  "monthlyAmount",
  "active",
  "billing",
  "dueDay",
  "startsOn",
  "endsOn",
  "currency",
  "paymentMethod",
  "paymentCardId",
] as const;

export function supplierFormDefaults(
  supplier?: SupplierDetail,
): SupplierFormInput {
  return {
    name: supplier?.name ?? "",
    // Same default as the gestão form: most suppliers are per vehicle.
    scope: supplier?.scope ?? "VEHICLE",
    monthlyAmount: supplier?.monthlyAmount ?? null,
    active: supplier?.active ?? true,
    billing: supplier?.billing ?? "SINGLE",
    dueDay: supplier?.dueDay ? String(supplier.dueDay) : NONE,
    startsOn: supplier?.startsOn ?? NONE,
    endsOn: supplier?.endsOn ?? NONE,
    currency: supplier?.currency ?? "BRL",
    paymentMethod: supplier?.paymentMethod ?? NONE,
    paymentCardId: supplier?.paymentCard?.id ?? NONE,
  };
}

export function toSupplierInput(values: SupplierFormValues): SupplierInput {
  return {
    name: values.name,
    scope: values.scope,
    monthlyAmount: values.monthlyAmount ?? 0,
    active: values.active,
    billing: values.scope === "COMPANY" ? "SINGLE" : values.billing,
    dueDay: values.dueDay === NONE ? null : Number(values.dueDay),
    startsOn: values.startsOn === NONE ? null : values.startsOn,
    endsOn: values.endsOn === NONE ? null : values.endsOn,
    ...toPayment(values),
  };
}

/** The form's payment fields → the API's (the card only when paid by card). */
function toPayment(values: SupplierFormValues) {
  const paymentMethod =
    values.paymentMethod === NONE ? null : (values.paymentMethod as ExpensePaymentMethod);
  return {
    currency: values.currency,
    paymentMethod,
    paymentCardId:
      usesCard(paymentMethod) && values.paymentCardId !== NONE ? values.paymentCardId : null,
  };
}
