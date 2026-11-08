import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { CustomerLicenseForm } from "@/components/organisms/customer-license-form";
import type { CustomerDetail } from "@/types/customer";

/** "Editar" (or "Informar") the CNH from the customer page. */
export function CustomerLicenseDialog({
  customer,
}: {
  customer: CustomerDetail;
}) {
  const [open, setOpen] = useState(false);
  const informed = Boolean(customer.driverLicense);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {informed ? <Pencil /> : <Plus />}
          {informed ? "Editar" : "Informar"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>CNH do cliente</DialogTitle>
        <DialogDescription>
          Fica no cadastro do cliente e vale para todos os contratos. Só é
          pedida de novo quando vencer.
        </DialogDescription>
        {/* Remounts on open: always starts from what is on file. */}
        {open && (
          <CustomerLicenseForm
            customerId={customer.id}
            current={{
              number: customer.driverLicense,
              issuedAt: customer.driverLicenseIssuedAt,
              validUntil: customer.driverLicenseValidUntil,
            }}
            submitLabel="Salvar CNH"
            stacked
            onSaved={() => setOpen(false)}
            cancel={
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
