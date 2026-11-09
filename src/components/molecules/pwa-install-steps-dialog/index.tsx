import { Share } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/atoms/dialog";
import { ListItem, OrderedList } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import type { InstallGuide } from "@/helpers/pwa";

const ShareIcon = () => (
  <Share
    className="inline size-4 align-text-bottom"
    aria-label="Compartilhar"
  />
);

const STEPS: Record<InstallGuide, { intro?: string; steps: ReactNode[] }> = {
  ios: {
    steps: [
      <>
        Toque em{" "}
        <Text inline weight="semibold">
          Compartilhar
        </Text>{" "}
        <ShareIcon /> na barra do Safari.
      </>,
      <>
        Role e toque em{" "}
        <Text inline weight="semibold">
          Adicionar à Tela de Início
        </Text>
        .
      </>,
      <>
        Toque em{" "}
        <Text inline weight="semibold">
          Adicionar
        </Text>
        .
      </>,
    ],
  },
  "ios-other-browser": {
    intro: "No iPhone, a instalação é feita pelo Safari.",
    steps: [
      <>
        Abra{" "}
        <Text inline weight="semibold">
          {window.location.host}
        </Text>{" "}
        no Safari.
      </>,
      <>
        Toque em{" "}
        <Text inline weight="semibold">
          Compartilhar
        </Text>{" "}
        <ShareIcon /> e depois em{" "}
        <Text inline weight="semibold">
          Adicionar à Tela de Início
        </Text>
        .
      </>,
    ],
  },
  manual: {
    steps: [
      <>
        Abra o menu do navegador (
        <Text inline weight="semibold">
          ⋮
        </Text>{" "}
        ou{" "}
        <Text inline weight="semibold">
          ☰
        </Text>
        ).
      </>,
      <>
        Toque em{" "}
        <Text inline weight="semibold">
          Instalar app
        </Text>{" "}
        ou{" "}
        <Text inline weight="semibold">
          Adicionar à tela inicial
        </Text>
        .
      </>,
      <>Confirme.</>,
    ],
  },
};

/** How to install by hand, when the browser offers no native prompt. */
export function PwaInstallStepsDialog({
  guide,
  open,
  onOpenChange,
}: {
  guide: InstallGuide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { intro, steps } = STEPS[guide];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Instalar o app</DialogTitle>
        <DialogDescription>
          Ele fica na tela inicial e abre direto, sem o navegador.
        </DialogDescription>
        {intro && <Text size="sm">{intro}</Text>}
        <OrderedList className="list-decimal space-y-2 pl-5 text-sm">
          {steps.map((step, index) => (
            <ListItem key={index}>{step}</ListItem>
          ))}
        </OrderedList>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Entendi</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
