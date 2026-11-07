import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { FormField } from "@/components/molecules/form-field";
import { loginSchema, type LoginFormValues } from "./schema";
import { errorMessage } from "@/helpers/api-error";
import { useLogin } from "@/hooks/api/auth/useLogin";

type LoginFormProps = {
  onSuccess: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, { onSuccess }),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField
        label="E-mail"
        type="email"
        autoComplete="username"
        inputMode="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormField
        label="Senha"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {login.isError && (
        <p
          role="alert"
          className="rounded-md bg-error px-3 py-2 text-sm text-error-foreground"
        >
          {errorMessage(login.error)}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Spinner className="text-primary-foreground" />}
        Entrar
      </Button>
    </form>
  );
}
