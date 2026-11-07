import { z } from "zod";

export const customerLoginSchema = z.object({
  identifier: z.string().trim().min(1, "Informe o e-mail ou o CPF"),
  password: z.string().min(1, "Informe a senha"),
});

export type CustomerLoginFormValues = z.infer<typeof customerLoginSchema>;
