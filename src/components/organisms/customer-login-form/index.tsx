import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { FormField } from "@/components/molecules/form-field";
import { customerLoginSchema, type CustomerLoginFormValues } from "./schema";
import { errorMessage } from "@/helpers/api-error";
import { useCustomerLogin } from "@/hooks/api/cliente/auth/useCustomerLogin";

type CustomerLoginFormProps = {
  onSuccess: () => void;
};

export function CustomerLoginForm({ onSuccess }: CustomerLoginFormProps) {
  const login = useCustomerLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerLoginFormValues>({
    resolver: zodResolver(customerLoginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, { onSuccess }),
  );

  return (
    <Form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField
        label="E-mail ou CPF"
        autoComplete="username"
        error={errors.identifier?.message}
        {...register("identifier")}
      />
      <FormField
        label="Senha"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Text size="xs" tone="muted">
        No primeiro acesso, use seu CPF como senha.
      </Text>
      {login.isError && <Alert>{errorMessage(login.error)}</Alert>}
      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Spinner className="text-primary-foreground" />}
        Entrar
      </Button>
    </Form>
  );
}
