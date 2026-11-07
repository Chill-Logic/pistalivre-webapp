import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { cn } from "@/utils/cn";

type ToolbarAction = {
  label: string;
  icon: LucideIcon;
  run: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  canRun?: (editor: Editor) => boolean;
};

const ACTIONS: ToolbarAction[] = [
  {
    label: "Negrito",
    icon: Bold,
    run: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive("bold"),
  },
  {
    label: "Itálico",
    icon: Italic,
    run: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive("italic"),
  },
  {
    label: "Título",
    icon: Heading2,
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (e) => e.isActive("heading", { level: 2 }),
  },
  {
    label: "Subtítulo",
    icon: Heading3,
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive("heading", { level: 3 }),
  },
  {
    label: "Lista",
    icon: List,
    run: (e) => e.chain().focus().toggleBulletList().run(),
    isActive: (e) => e.isActive("bulletList"),
  },
  {
    label: "Lista numerada",
    icon: ListOrdered,
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    isActive: (e) => e.isActive("orderedList"),
  },
  {
    label: "Desfazer",
    icon: Undo2,
    run: (e) => e.chain().focus().undo().run(),
    canRun: (e) => e.can().undo(),
  },
  {
    label: "Refazer",
    icon: Redo2,
    run: (e) => e.chain().focus().redo().run(),
    canRun: (e) => e.can().redo(),
  },
];

type RichTextToolbarProps = {
  editor: Editor;
  /** Extra controls at the end (e.g. "Inserir variável"). */
  children?: ReactNode;
};

/** Formatting buttons over the editor; pressed state follows the cursor. */
export function RichTextToolbar({ editor, children }: RichTextToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      ACTIONS.map((action) => ({
        active: action.isActive?.(current) ?? false,
        enabled: action.canRun?.(current) ?? true,
      })),
  });

  return (
    <Box
      role="toolbar"
      aria-label="Formatação"
      className="flex flex-wrap items-center gap-0.5 rounded-t-md border bg-muted/40 p-1"
    >
      {ACTIONS.map((action, index) => {
        const Icon = action.icon;
        const { active, enabled } = state[index];
        return (
          <Button
            key={action.label}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={action.label}
            title={action.label}
            aria-pressed={action.isActive ? active : undefined}
            disabled={!enabled}
            onClick={() => action.run(editor)}
            className={cn(
              "size-9 md:size-8",
              active && "bg-accent text-foreground",
            )}
          >
            <Icon />
          </Button>
        );
      })}
      {children && <Box className="ml-auto">{children}</Box>}
    </Box>
  );
}
