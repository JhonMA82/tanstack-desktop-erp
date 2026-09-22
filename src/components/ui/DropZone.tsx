import { useId, useRef } from "react";
import { cn } from "@/lib/cn";

export interface DropZoneProps {
  /** Receives the picked files (click or drag & drop). */
  onFiles: (files: FileList) => void;
  /** Zone copy; defaults to the source drop-zone hint. */
  label?: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

/**
 * Click-or-drop file picker styled like the source `.drop-zone` (60px dashed
 * box). The drop target is a real `<button>` so keyboard activation works
 * natively; the file input stays a visually hidden sibling.
 */
export function DropZone({ onFiles, label, accept, multiple = true, className }: DropZoneProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFiles = (files: FileList | null | undefined) => {
    if (files && files.length > 0) {
      onFiles(files);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          pickFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex h-[60px] w-full cursor-pointer items-center justify-center rounded-[2px] border border-dashed border-border-l bg-panel2 px-4 text-center font-mono text-[10px] tracking-[0.06em] text-ink-dim uppercase",
          "hover:border-orange hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-orange",
        )}
      >
        {label ?? "DROP FILES HERE — CLICK TO BROWSE — PDF / JPG / PNG — MAX 10MB"}
      </button>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          pickFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
