import { cn } from "@/lib/utils";

type Tone = "accent" | "ok" | "warn" | "danger" | "red";

const FILL: Record<Tone, string> = {
  accent: "bg-accent",
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  red: "bg-brand-red-600 dark:bg-brand-red-400",
};

/**
 * Thanh điểm ngang — dùng cho cosine / BM25 / rerank score.
 * `value` đã chuẩn hoá về [0, 1]; `label` là chuỗi hiển thị bên phải.
 */
export function ScoreBar({
  value,
  label,
  tone = "accent",
  className,
  width = "w-24",
}: {
  value: number;
  label?: string;
  tone?: Tone;
  className?: string;
  width?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "relative h-1.5 overflow-hidden rounded-full bg-surface-3",
          width,
        )}
        role="presentation"
      >
        <span
          className={cn("absolute inset-y-0 left-0 rounded-full", FILL[tone])}
          style={{ width: `${pct}%` }}
        />
      </span>
      {label ? (
        <span className="font-mono text-[11px] tabular-nums text-fg-muted">
          {label}
        </span>
      ) : null}
    </span>
  );
}

/** Chọn tone theo mức điểm — dùng chung để màu sắc nhất quán giữa các trang. */
export function scoreTone(value: number): Tone {
  if (value >= 0.7) return "ok";
  if (value >= 0.48) return "accent";
  if (value >= 0.3) return "warn";
  return "danger";
}
