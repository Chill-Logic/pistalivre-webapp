import { Copy, QrCode } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Image } from "@/components/atoms/image";
import { Text } from "@/components/atoms/text";
import { useCopy } from "@/hooks/ui/useCopy";
import type { Charge } from "@/types/rental";
import { formatDateTime } from "@/utils/format";

type PixQrDialogProps = {
  pix: NonNullable<Charge["pix"]>;
  /** What the charge is ("Aluguel · R$ 80,00"), on the dialog's title. */
  title: string;
};

/** The charge's pix QR (to show the customer) plus the copy-and-paste code. */
export function PixQrDialog({ pix, title }: PixQrDialogProps) {
  const copy = useCopy();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode />
          QR do pix
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogTitle>QR do pix</DialogTitle>
        <DialogDescription>{title}</DialogDescription>
        <Box className="flex flex-col items-center gap-3">
          <Image
            src={`data:image/png;base64,${pix.encodedImage}`}
            alt="QR Code do pix"
            className="size-56 rounded-md bg-white p-2"
          />
          {pix.expirationDate && (
            <Text size="xs" tone="muted">
              Válido até {formatDateTime(pix.expirationDate)}
            </Text>
          )}
          <Text
            size="xs"
            mono
            className="max-h-24 w-full overflow-y-auto break-all rounded-md bg-muted p-2"
          >
            {pix.payload}
          </Text>
          <Button
            className="w-full"
            onClick={() => copy(pix.payload, "Pix copiado")}
          >
            <Copy />
            Copiar código pix
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
