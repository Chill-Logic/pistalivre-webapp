import { z } from "zod";
import { DEFAULT_NATIONALITY } from "@/constants/customer";
import type { CustomerDetail } from "@/types/customer";
import type { CustomerInput } from "@/types/customer-input";
import { isValidCpf } from "@/utils/cpf";
import { brDateToDay, dayToBrDate, todayInBrasilia } from "@/utils/date";
import { onlyDigits } from "@/utils/masks";

const optional = (max: number) => z.string().trim().max(max);
const isPhone = (value: string) => [10, 11].includes(onlyDigits(value).length);

/** Mirrors the API's createCustomerSchema (same PT messages). */
export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  document: z.string().refine(isValidCpf, "CPF inválido"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  phone: z.string().refine(isPhone, "Telefone inválido"),
  maritalStatus: optional(40),
  profession: optional(80),
  birthDate: z.string().refine((value) => {
    if (!value) return true;
    const day = brDateToDay(value);
    return day !== null && day <= todayInBrasilia() && day >= "1900-01-01";
  }, "Data de nascimento inválida"),
  rg: optional(40),
  emergencyContactName: optional(120),
  emergencyContactRelation: optional(40),
  emergencyContactPhone: z
    .string()
    .refine(
      (value) => !value || isPhone(value),
      "Telefone do contato de emergência inválido",
    ),
  emergencyContactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => !value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
      "E-mail do contato de emergência inválido",
    ),
  zip: optional(12),
  addressLine: optional(200),
  addressNumber: optional(20),
  complement: optional(120),
  neighborhood: optional(120),
  city: optional(80),
  state: optional(40),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

/** Fields the API may report back by name (422 `fields`). */
export const CUSTOMER_FORM_FIELDS = Object.keys(
  customerFormSchema.shape,
) as (keyof CustomerFormValues)[];

export function customerFormDefaults(
  customer?: CustomerDetail,
  prefill: Partial<CustomerFormValues> = {},
): CustomerFormValues {
  const address = customer?.address;
  const emergency = customer?.emergencyContact;
  return {
    name: customer?.name ?? "",
    document: customer?.document ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    maritalStatus: customer?.maritalStatus ?? "",
    profession: customer?.profession ?? "",
    birthDate: customer?.birthDate ? dayToBrDate(customer.birthDate) : "",
    rg: customer?.rg ?? "",
    emergencyContactName: emergency?.name ?? "",
    emergencyContactRelation: emergency?.relation ?? "",
    emergencyContactPhone: emergency?.phone ?? "",
    emergencyContactEmail: emergency?.email ?? "",
    zip: address?.zip ?? "",
    addressLine: address?.line ?? "",
    addressNumber: address?.number ?? "",
    complement: address?.complement ?? "",
    neighborhood: address?.neighborhood ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    ...prefill,
  };
}

const orNull = (value: string) => (value.trim() ? value.trim() : null);

export function toCustomerInput(values: CustomerFormValues): CustomerInput {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    document: values.document,
    nationality: DEFAULT_NATIONALITY,
    maritalStatus: orNull(values.maritalStatus),
    profession: orNull(values.profession),
    birthDate: values.birthDate ? brDateToDay(values.birthDate) : null,
    rg: orNull(values.rg),
    emergencyContactName: orNull(values.emergencyContactName),
    emergencyContactRelation: orNull(values.emergencyContactRelation),
    emergencyContactPhone: orNull(values.emergencyContactPhone),
    emergencyContactEmail: orNull(values.emergencyContactEmail),
    addressLine: orNull(values.addressLine),
    addressNumber: orNull(values.addressNumber),
    neighborhood: orNull(values.neighborhood),
    complement: orNull(values.complement),
    city: orNull(values.city),
    state: orNull(values.state),
    zip: orNull(values.zip),
  };
}
