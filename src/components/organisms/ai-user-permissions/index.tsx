import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { List, ListItem } from "@/components/atoms/list";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { SelectField } from "@/components/molecules/select-field";
import { useSaveAiPermissions } from "@/hooks/api/gestao/ai/useAi";
import type { AiPermissions } from "@/types/ai";
import { groupInOrder } from "@/utils/group";

type Person = AiPermissions["users"][number];
type Choice = "default" | "allow" | "deny";

/** Per person: adjustments over the role's default (allow / take away). */
export function AiUserPermissions({ data }: { data: AiPermissions }) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Ajustes por pessoa</CardTitle>
        <Text size="sm" tone="muted">
          Cada pessoa usa o padrão do papel dela; aqui você libera ou tira
          ferramentas de alguém específico.
        </Text>
      </CardHeader>
      <CardContent>
        <List className="divide-y">
          {data.users.map((person) => (
            <ListItem
              key={person.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <Box className="min-w-0">
                <Text weight="medium">{person.name}</Text>
                <Text size="xs" tone="muted">
                  {person.role === "ADMIN" ? "Administrador" : "Agente"} ·{" "}
                  {person.effective.length} de {data.tools.length} ferramentas
                  {person.allow.length + person.deny.length > 0 &&
                    ` · ${person.allow.length + person.deny.length} ajuste(s)`}
                </Text>
              </Box>
              <PersonDialog person={person} data={data} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

function PersonDialog({
  person,
  data,
}: {
  person: Person;
  data: AiPermissions;
}) {
  const { user: save } = useSaveAiPermissions();
  const [open, setOpen] = useState(false);
  const initial = () =>
    Object.fromEntries(
      data.tools.map((t) => [
        t.name,
        (person.allow.includes(t.name)
          ? "allow"
          : person.deny.includes(t.name)
            ? "deny"
            : "default") as Choice,
      ]),
    );
  const [choices, setChoices] = useState<Record<string, Choice>>(initial);
  const roleTools = data.roles[person.role] ?? [];

  const submit = () =>
    save.mutate(
      {
        userId: person.id,
        allow: Object.keys(choices).filter((t) => choices[t] === "allow"),
        deny: Object.keys(choices).filter((t) => choices[t] === "deny"),
      },
      { onSuccess: () => setOpen(false) },
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setChoices(initial());
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal />
          Ajustar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogTitle>Ferramentas de {person.name}</DialogTitle>
        <DialogDescription>
          “Padrão do papel” segue o que o papel{" "}
          {person.role === "ADMIN" ? "administrador" : "agente"} tem.
        </DialogDescription>
        <List className="space-y-5">
          {groupInOrder(data.tools, (tool) => tool.area).map(
            ([area, tools]) => (
              <ListItem key={area} className="space-y-3">
                <Text size="sm" weight="semibold">
                  {area}
                </Text>
                <List className="space-y-3">
                  {tools.map((tool) => (
                    <ListItem key={tool.name}>
                      <SelectField
                        label={
                          tool.kind === "write"
                            ? `${tool.title} (escrita, com confirmação)`
                            : tool.title
                        }
                        value={choices[tool.name]}
                        options={[
                          {
                            value: "default",
                            label: `Padrão do papel (${roleTools.includes(tool.name) ? "liberada" : "bloqueada"})`,
                          },
                          { value: "allow", label: "Liberar para esta pessoa" },
                          { value: "deny", label: "Tirar desta pessoa" },
                        ]}
                        onChange={(value) =>
                          setChoices((current) => ({
                            ...current,
                            [tool.name]: value as Choice,
                          }))
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </ListItem>
            ),
          )}
        </List>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={save.isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={save.isPending}>
            {save.isPending && <Spinner className="text-primary-foreground" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
