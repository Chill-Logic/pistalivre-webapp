import { Box } from "@/components/atoms/box";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { PageHeader } from "@/components/molecules/page-header";

export function DashboardPage() {
  return (
    <Box className="space-y-6">
      <PageHeader title="Painel" />
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
