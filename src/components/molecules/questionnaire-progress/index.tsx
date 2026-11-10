import { Box } from "@/components/atoms/box";
import { ListItem, OrderedList } from "@/components/atoms/list";
import { Text } from "@/components/atoms/text";
import { cn } from "@/utils/cn";

const STEPS = ["Seu perfil", "Planos", "Cadastro"] as const;

/** The questionnaire's three steps (4 = all done). */
export function QuestionnaireProgress({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <OrderedList className="flex items-start gap-2" aria-label="Etapas">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const active = current === step;
        return (
          <ListItem
            key={label}
            className="flex flex-1 flex-col gap-1"
            aria-current={active ? "step" : undefined}
          >
            <Box
              aria-hidden="true"
              className={cn(
                "h-1.5 rounded-full",
                current >= step ? "bg-primary" : "bg-muted",
              )}
            />
            <Text
              size="xs"
              tone={active ? "foreground" : "muted"}
              weight={active ? "medium" : "normal"}
            >
              {label}
            </Text>
          </ListItem>
        );
      })}
    </OrderedList>
  );
}
