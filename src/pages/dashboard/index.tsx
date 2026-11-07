import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { PageHeader } from "@/components/molecules/page-header";
import { useSession } from "@/hooks/auth/useSession";
import { firstName } from "@/utils/format";

export function DashboardPage() {
  const { user } = useSession();

  return (
    <Box className="space-y-6">
      <PageHeader
        title="Painel"
        description={
          user ? `Bem-vindo(a), ${firstName(user.name)}.` : undefined
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Nova interface em construção</CardTitle>
          <CardDescription>
            As telas da gestão chegam aqui conforme a API for publicada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Enquanto isso, a operação segue pelo sistema atual.
          </CardDescription>
        </CardContent>
      </Card>
    </Box>
  );
}
