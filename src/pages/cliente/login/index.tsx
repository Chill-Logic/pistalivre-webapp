import { useNavigate, useSearchParams } from "react-router-dom";
import { CustomerLoginForm } from "@/components/organisms/customer-login-form";
import { AuthLayout } from "@/components/templates/auth-layout";
import { safeRedirect } from "@/helpers/safe-redirect";

export function CustomerLoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <AuthLayout title="Área do cliente">
      <CustomerLoginForm
        onSuccess={() =>
          navigate(safeRedirect(params.get("callbackUrl"), "cliente"), {
            replace: true,
          })
        }
      />
    </AuthLayout>
  );
}
