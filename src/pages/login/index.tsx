import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/login-form";
import { safeRedirect } from "@/helpers/safe-redirect";

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <AuthLayout title="Entrar" description="Acesse a gestão da locadora.">
      <LoginForm
        onSuccess={() =>
          navigate(safeRedirect(params.get("callbackUrl")), { replace: true })
        }
      />
    </AuthLayout>
  );
}
