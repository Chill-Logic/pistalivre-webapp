import { Fragment, useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Alert } from "@/components/atoms/alert";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Checkbox } from "@/components/atoms/checkbox";
import { Spinner } from "@/components/atoms/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Text } from "@/components/atoms/text";
import { AI_TOOL_KIND_LABELS } from "@/constants/ai";
import { useSaveAiPermissions } from "@/hooks/api/gestao/ai/useAi";
import type { AiPermissions, AiToolKind } from "@/types/ai";
import { groupInOrder } from "@/utils/group";

const ROLES = [
  { key: "ADMIN", label: "Administrador" },
  { key: "AGENT", label: "Agente" },
] as const;

const KIND_BADGE: Record<AiToolKind, "neutral" | "outline" | "warning"> = {
  read: "neutral",
  draft: "outline",
  write: "warning",
};

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((t) => b.includes(t));

/**
 * Each role's DEFAULT tools (a person can still be adjusted below). Saved per
 * role; the change applies on the next call, in the chat and in every
 * connected app.
 */
export function AiRolePermissions({ data }: { data: AiPermissions }) {
  const { role: save } = useSaveAiPermissions();
  const [draft, setDraft] = useState<Record<string, string[]>>(data.roles);

  const toggle = (role: string, tool: string, on: boolean) =>
    setDraft((current) => ({
      ...current,
      [role]: on
        ? [...(current[role] ?? []), tool]
        : (current[role] ?? []).filter((t) => t !== tool),
    }));

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Ferramentas por papel</CardTitle>
        <Text size="sm" tone="muted">
          O padrão de cada papel. Leitura consulta dados; rascunho só edita o
          documento aberto no editor; escrita muda dados, sempre depois que a
          pessoa confirma.
        </Text>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="info" role="note">
          Ferramentas sensíveis e todas as de escrita começam desligadas: só
          valem depois que você marcar. Uma ferramenta nova segue o padrão dela
          até você salvar o papel de novo. Nenhuma ferramenta movimenta
          dinheiro.
        </Alert>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Ferramenta</TableHead>
              {ROLES.map((r) => (
                <TableHead key={r.key} className="w-32 text-center">
                  {r.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupInOrder(data.tools, (tool) => tool.area).map(
              ([area, tools]) => (
                <Fragment key={area}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={ROLES.length + 1}>
                      <Text size="sm" weight="semibold">
                        {area}
                      </Text>
                    </TableCell>
                  </TableRow>
                  {tools.map((tool) => (
                    <TableRow key={tool.name}>
                      <TableCell className="min-w-64 whitespace-normal">
                        <Box className="flex flex-wrap items-center gap-2">
                          <Text weight="medium">{tool.title}</Text>
                          <Badge variant={KIND_BADGE[tool.kind]}>
                            {AI_TOOL_KIND_LABELS[tool.kind]}
                          </Badge>
                          {tool.defaultOff && (
                            <Badge variant="outline">Começa desligada</Badge>
                          )}
                          {!tool.channels.includes("mcp") && (
                            <Text inline size="xs" tone="muted">
                              só no chat
                            </Text>
                          )}
                        </Box>
                        <Text size="xs" tone="muted">
                          {tool.description}
                        </Text>
                      </TableCell>
                      {ROLES.map((r) => (
                        <TableCell key={r.key} className="text-center">
                          <Checkbox
                            aria-label={`${tool.title} para ${r.label}`}
                            checked={(draft[r.key] ?? []).includes(tool.name)}
                            onCheckedChange={(on) =>
                              toggle(r.key, tool.name, on === true)
                            }
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </Fragment>
              ),
            )}
          </TableBody>
        </Table>
        <Box className="flex flex-wrap justify-end gap-2">
          {ROLES.map((r) => {
            const changed = !sameSet(
              draft[r.key] ?? [],
              data.roles[r.key] ?? [],
            );
            return (
              <Button
                key={r.key}
                type="button"
                variant={changed ? "default" : "outline"}
                disabled={!changed || save.isPending}
                onClick={() =>
                  save.mutate({ role: r.key, tools: draft[r.key] ?? [] })
                }
              >
                {save.isPending && save.variables?.role === r.key && (
                  <Spinner className="text-primary-foreground" />
                )}
                Salvar {r.label.toLowerCase()}
              </Button>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
