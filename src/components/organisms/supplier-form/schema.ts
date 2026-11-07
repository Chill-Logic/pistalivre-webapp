import { z } from "zod";
import type { SupplierDetail, SupplierInput } from "@/types/supplier";

/** Mirrors the API's supplierSchema (same PT messages). */
export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(160),
  scope: z.enum(["COMPANY", "VEHICLE"], {
    errorMap: () => ({ message: "Escopo inválido" }),
  }),
  monthlyAmount: z
    .number({ invalid_type_error: "Informe o valor" })
    .nullable()
    .refine((value) => value !== null && value >= 0, "Informe o valor"),
  active: z.boolean(),
});

export type SupplierFormInput = z.input<typeof supplierFormSchema>;
export type SupplierFormValues = z.output<typeof supplierFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const SUPPLIER_FORM_FIELDS = [
  "name",
  "scope",
  "monthlyAmount",
  "active",
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
  };
}

export function toSupplierInput(values: SupplierFormValues): SupplierInput {
  return {
    name: values.name,
    scope: values.scope,
    monthlyAmount: values.monthlyAmount ?? 0,
    active: values.active,
  };
}
