"use client";

import { ChevronRight } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Khối thu/mở dùng chung (không phụ thuộc thư viện ngoài).
 * Dùng cho: trace pipeline, từng bước, nguồn tham khảo, chi tiết chunk.
 */
export function Collapsible({
  summary,
  children,
  defaultOpen = false,
  className,
  panelClassName,
  triggerClassName,
  chevronClassName,
}: {
  summary: React.ReactNode | ((open: boolean) => React.ReactNode);
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  panelClassName?: string;
  triggerClassName?: string;
  chevronClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex w-full items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          triggerClassName,
        )}
      >
        <ChevronRight
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-fg-subtle transition-transform duration-200",
            open && "rotate-90",
            chevronClassName,
          )}
        />
        <span className="min-w-0 flex-1">
          {typeof summary === "function" ? summary(open) : summary}
        </span>
      </button>
      {open ? (
        <div id={panelId} className={cn("animate-fade-in", panelClassName)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
