import { Cake } from "lucide-react";
import { Box } from "@/components/atoms/box";
import { Badge } from "@/components/atoms/badge";
import { Card } from "@/components/atoms/card";
import { List, ListItem } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { TextLink } from "@/components/molecules/text-link";
import { routeTo } from "@/constants/routes";
import type { Birthday } from "@/types/dashboard";

/**
 * Who turns a year older today (customers and staff). Renders nothing when
 * there is nobody — the dashboard stays as it was.
 */
export function BirthdayBanner({ birthdays }: { birthdays: Birthday[] }) {
  if (birthdays.length === 0) return null;
  return (
    <Card className="flex items-start gap-3 border-primary/30 bg-primary/5 p-4">
      <Cake className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
      <Box className="min-w-0 flex-1 space-y-2">
        <Text weight="semibold">Aniversariantes de hoje</Text>
        <List className="flex flex-wrap gap-x-5 gap-y-2">
          {birthdays.map((person) => (
            <ListItem
              key={`${person.kind}-${person.id}`}
              className="flex items-center gap-2"
            >
              {person.kind === "CUSTOMER" ? (
                <TextLink to={routeTo.customer(person.id)}>
                  {person.name}
                </TextLink>
              ) : (
                <Text inline weight="medium">
                  {person.name}
                </Text>
              )}
              <Text inline size="xs" tone="muted">
                {person.age} anos
              </Text>
              <Badge
                variant={person.kind === "CUSTOMER" ? "neutral" : "outline"}
              >
                {person.kind === "CUSTOMER" ? "Cliente" : "Equipe"}
              </Badge>
            </ListItem>
          ))}
        </List>
      </Box>
    </Card>
  );
}
