import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { buttonVariants } from "@/components/atoms/button/variants";
import { cn } from "@/utils/cn";

/**
 * Calendar (shadcn style on react-day-picker), drawn by us — never the
 * browser's native date picker. Portuguese, weeks starting on Sunday.
 */
export function Calendar({
  className,
  classNames,
  ...props
}: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-3",
        month_caption: "flex h-9 items-center justify-center",
        caption_label: "text-sm font-medium capitalize",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-9 md:size-8",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-9 md:size-8",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-10 text-[0.75rem] font-normal capitalize text-muted-foreground md:w-9",
        week: "mt-1 flex w-full",
        day: "relative size-10 p-0 text-center text-sm md:size-9 [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected].range_start)]:rounded-l-md",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-10 p-0 font-normal aria-selected:opacity-100 md:size-9",
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        range_start: "range_start rounded-l-md bg-primary/15",
        range_end: "range_end rounded-r-md bg-primary/15",
        range_middle:
          "bg-primary/15 [&>button]:!bg-transparent [&>button]:!text-foreground",
        today:
          "[&>button]:font-semibold [&>button]:underline [&>button]:underline-offset-4",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  );
}
