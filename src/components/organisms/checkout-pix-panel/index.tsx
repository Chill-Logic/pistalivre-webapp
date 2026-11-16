import { Copy } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { Image } from "@/components/atoms/image";
import { Text } from "@/components/atoms/text";
import { useCopy } from "@/hooks/ui/useCopy";

/** PIX of the checkout: the QR (to scan from another phone) and the copy-and-paste code. */
export function CheckoutPixPanel({ pix }: { pix: { payload: string; encodedImage: string } }) {
  const copy = useCopy();
  return (
    <Box className="flex flex-col items-center gap-4">
      <Button className="w-full" onClick={() => copy(pix.payload, "Código PIX copiado")}>
        <Copy />
        Copiar código PIX
      </Button>
      <Text size="sm" tone="muted" className="text-center">
        Abra o app do seu banco, escolha PIX › Copia e cola e cole o código. Ou leia o QR com outro
        celular.
      </Text>
      <Image
        src={`data:image/png;base64,${pix.encodedImage}`}
        alt="QR Code do PIX"
        className="size-56 rounded-md bg-white p-2"
      />
      <Text size="xs" className="max-h-20 font-mono w-full overflow-y-auto break-all rounded-md bg-muted p-2">
        {pix.payload}
      </Text>
      <Text size="xs" tone="muted" className="text-center">
        Depois de pagar, esta página confirma sozinha em alguns segundos.
      </Text>
    </Box>
  );
}
