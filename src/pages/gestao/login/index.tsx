import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/login-form";
import { safeRedirect } from "@/helpers/safe-redirect";

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <AuthLayout title="Entrar">
      <LoginForm
        onSuccess={() =>
          navigate(safeRedirect(params.get("callbackUrl"), "gestao"), {
            replace: true,
          })
        }
      />
    </AuthLayout>
  );
}
