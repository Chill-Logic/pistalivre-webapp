import { Link } from "react-router-dom";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Heading } from "@/components/atoms/heading";
import { Text } from "@/components/atoms/text";
import { HOST_REALM, ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  return (
    <Box className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <Text size="5xl" weight="bold" tone="primary">
        404
      </Text>
      <Heading variant="title">Página não encontrada</Heading>
      <Text tone="muted">
        O endereço que você acessou não existe ou foi movido.
      </Text>
      <Button asChild>
        <Link to={HOST_REALM === "cliente" ? ROUTES.portal : ROUTES.dashboard}>
          {HOST_REALM === "cliente" ? "Voltar ao início" : "Voltar ao painel"}
        </Link>
      </Button>
    </Box>
  );
}
