"use client";

import { Loader2, Play, Search } from "lucide-react";
import type { RetrievalSample } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/**
 * Ô nhập truy vấn + nút chạy + các truy vấn mẫu.
 * Hai truy vấn cuối cố tình lạc đề để demo nhánh PageIndex fallback.
 */
export function QueryBar({
  value,
  onChange,
  onRun,
  samples,
  activeQuestion,
  pending,
}: {
  value: string;
  onChange: (value: string) => void;
  onRun: (query: string) => void;
  samples: RetrievalSample[];
  activeQuestion: string;
  pending: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onRun(value);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
            aria-hidden
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nhập câu hỏi để chạy thử pipeline truy xuất…"
            aria-label="Truy vấn thử nghiệm"
            className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          />
        </div>
        <button
          type="submit"
          disabled={pending || value.trim().length === 0}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
          Chạy pipeline
        </button>
      </form>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-fg-subtle">Truy vấn mẫu:</span>
        {samples.map((sample) => {
          const active = sample.question === activeQuestion;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                onChange(sample.question);
                onRun(sample.question);
              }}
              aria-pressed={active}
              title={sample.question}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active
                  ? "border-accent/40 bg-accent-soft text-accent"
                  : "border-border bg-surface text-fg-muted hover:bg-surface-3 hover:text-fg",
              )}
            >
              {sample.label}
              {sample.offTopic ? <Badge tone="warn">lạc đề</Badge> : null}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">
        Truy vấn tự do không khớp kho tri thức sẽ được dựng thành một lượt chạy lạc
        đề: điểm cosine gốc thấp, nhánh PageIndex kích hoạt.
      </p>
    </div>
  );
}
