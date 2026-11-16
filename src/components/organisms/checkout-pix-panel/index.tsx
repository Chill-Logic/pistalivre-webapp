import { Copy } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Col, Row } from "@/components/atoms/grid";
import { Image } from "@/components/atoms/image";
import { Text } from "@/components/atoms/text";
import { useCopy } from "@/hooks/ui/useCopy";

/**
 * PIX of the checkout: the copy-and-paste code (first on the phone, where the
 * payer usually is) and the QR to scan from another phone. Desktop: QR on the
 * left, the code and the steps on the right.
 */
export function CheckoutPixPanel({
  pix,
}: {
  pix: { payload: string; encodedImage: string };
}) {
  const copy = useCopy();
  return (
    <Row className="items-center gap-y-4">
      <Col lg={5} className="order-2 flex justify-center lg:order-1">
        <Image
          src={`data:image/png;base64,${pix.encodedImage}`}
          alt="QR Code do PIX"
          className="size-56 rounded-md bg-white p-2 lg:size-64"
        />
      </Col>
      <Col lg={7} className="order-1 lg:order-2">
        <Box className="space-y-4">
          <Button
            className="w-full"
            onClick={() => copy(pix.payload, "Código PIX copiado")}
          >
            <Copy />
            Copiar código PIX
          </Button>
          <Text size="sm" tone="muted" className="text-center lg:text-left">
            Abra o app do seu banco, escolha PIX › Copia e cola e cole o código.
            Ou leia o QR com outro celular.
          </Text>
          <Text
            size="xs"
            className="max-h-20 w-full overflow-y-auto break-all rounded-md bg-muted p-2 font-mono"
          >
            {pix.payload}
          </Text>
          <Text size="xs" tone="muted" className="text-center lg:text-left">
            Depois de pagar, esta página confirma sozinha em alguns segundos.
          </Text>
        </Box>
      </Col>
    </Row>
  );
}
