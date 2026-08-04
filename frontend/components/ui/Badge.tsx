import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "ok"
  | "warn"
  | "danger"
  | "legal"
  | "news";

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-surface-3 text-fg-muted border-border",
  accent: "bg-accent-soft text-accent border-accent/25",
  ok: "bg-ok-soft text-ok border-ok/25",
  warn: "bg-warn-soft text-warn border-warn/25",
  danger: "bg-danger-soft text-danger border-danger/25",
  legal: "bg-brand-blue-50 text-brand-blue-700 border-brand-blue-200 dark:bg-brand-blue-950/60 dark:text-brand-blue-300 dark:border-brand-blue-800",
  news: "bg-brand-red-50 text-brand-red-700 border-brand-red-200 dark:bg-brand-red-950/60 dark:text-brand-red-300 dark:border-brand-red-800",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  mono = false,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
  mono?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
        mono && "font-mono tabular-nums",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Nhãn loại tài liệu — dùng chung cho Chat, Knowledge, Retrieval. */
export function DocTypeBadge({ type }: { type: "legal" | "news" }) {
  return (
    <Badge tone={type === "legal" ? "legal" : "news"}>
      {type === "legal" ? "legal" : "news"}
    </Badge>
  );
}
