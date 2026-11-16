import { z } from "zod";
import { isValidPhone } from "@/utils/masks";
import { DEFAULT_NATIONALITY } from "@/constants/customer";
import type { CustomerDetail } from "@/types/customer";
import type { CustomerInput } from "@/types/customer-input";
import { isValidCpf } from "@/utils/cpf";
import { brDateToDay, dayToBrDate, todayInBrasilia } from "@/utils/date";

const optional = (max: number) => z.string().trim().max(max);
// With or without the DDI; a number that can exist (mobile starts with 9).
const isPhone = (value: string) => isValidPhone(value);

/** Same limit as the API. */
export const MAX_EMERGENCY_CONTACTS = 5;

/** One emergency contact: all optional, but a phone/e-mail typed must be valid. */
const emergencyContactSchema = z.object({
  name: optional(120),
  relation: optional(40),
  phone: z
    .string()
    .refine(
      (value) => !value || isPhone(value),
      "Telefone do contato de emergência inválido",
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => !value || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
      "E-mail do contato de emergência inválido",
    ),
});

export type EmergencyContactFormValues = z.infer<typeof emergencyContactSchema>;

export const emptyEmergencyContact = (): EmergencyContactFormValues => ({
  name: "",
  relation: "",
  phone: "",
  email: "",
});

/** Mirrors the API's createCustomerSchema (same PT messages). */
export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  document: z.string().refine(isValidCpf, "CPF inválido"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  phone: z
    .string()
    .refine(isPhone, "Telefone inválido: confira o DDD e o número (celular começa com 9)"),
  maritalStatus: optional(40),
  profession: optional(80),
  birthDate: z.string().refine((value) => {
    if (!value) return true;
    const day = brDateToDay(value);
    return day !== null && day <= todayInBrasilia() && day >= "1900-01-01";
  }, "Data de nascimento inválida"),
  rg: optional(40),
  emergencyContacts: z
    .array(emergencyContactSchema)
    .max(MAX_EMERGENCY_CONTACTS, `Até ${MAX_EMERGENCY_CONTACTS} contatos de emergência`),
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
  return {
    name: customer?.name ?? "",
    document: customer?.document ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    maritalStatus: customer?.maritalStatus ?? "",
    profession: customer?.profession ?? "",
    birthDate: customer?.birthDate ? dayToBrDate(customer.birthDate) : "",
    rg: customer?.rg ?? "",
    emergencyContacts: (customer?.emergencyContacts ?? []).map((c) => ({
      name: c.name ?? "",
      relation: c.relation ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
    })),
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
    emergencyContacts: values.emergencyContacts
      .map((c) => ({
        name: orNull(c.name),
        relation: orNull(c.relation),
        phone: orNull(c.phone),
        email: orNull(c.email),
      }))
      .filter((c) => c.name || c.relation || c.phone || c.email),
    addressLine: orNull(values.addressLine),
    addressNumber: orNull(values.addressNumber),
    neighborhood: orNull(values.neighborhood),
    complement: orNull(values.complement),
    city: orNull(values.city),
    state: orNull(values.state),
    zip: orNull(values.zip),
  };
}
