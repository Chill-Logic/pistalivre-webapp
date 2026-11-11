import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type DropAreaProps = {
  /** Files dropped on the area (only files: dragged text is left alone). */
  onFiles: (files: File[]) => void;
  /** What shows over the area while a file is dragged over it. */
  overlay: ReactNode;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

const hasFiles = (event: DragEvent) =>
  Array.from(event.dataTransfer.types).includes("Files");

/**
 * A region that takes files dragged from the computer: the overlay appears
 * while a file is over it (counting enter/leave, so moving across children
 * doesn't make it blink) and the drop hands the files over.
 */
export function DropArea({
  onFiles,
  overlay,
  disabled,
  className,
  children,
}: DropAreaProps) {
  const depth = useRef(0);
  const [over, setOver] = useState(false);

  const reset = () => {
    depth.current = 0;
    setOver(false);
  };

  return (
    <div
      className={cn("relative", className)}
      onDragEnter={(event) => {
        if (disabled || !hasFiles(event)) return;
        event.preventDefault();
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(event) => {
        if (disabled || !hasFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        if (disabled || !hasFiles(event)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      }}
      onDrop={(event) => {
        if (disabled || !hasFiles(event)) return;
        event.preventDefault();
        reset();
        const files = Array.from(event.dataTransfer.files);
        if (files.length) onFiles(files);
      }}
    >
      {children}
      {over && (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] border-2 border-dashed border-primary bg-background/90"
          aria-hidden
        >
          {overlay}
        </div>
      )}
    </div>
  );
}
