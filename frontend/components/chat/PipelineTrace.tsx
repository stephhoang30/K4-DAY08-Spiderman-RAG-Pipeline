"use client";

import { ChevronRight, Loader2, Timer } from "lucide-react";
import { useId, useState } from "react";
import type { PipelineStep, PipelineStepStatus } from "@/lib/types";
import type { DataSource } from "@/lib/data";
import { STATUS_CLASS, STATUS_LABEL, STEP_ICON } from "./stepMeta";
import { StepDetails } from "./StepDetails";
import { DataSourceBadge, WiringBadge } from "@/components/ui/DataSource";
import { cn, formatMs } from "@/lib/utils";

function StatusBadge({ status }: { status: PipelineStepStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap",
        STATUS_CLASS[status],
      )}
    >
      {status === "running" ? (
        <Loader2 className="size-3 animate-spin" aria-hidden />
      ) : null}
      {STATUS_LABEL[status]}
    </span>
  );
}

function StepRow({
  step,
  index,
  isLast,
  running,
}: {
  step: PipelineStep;
  index: number;
  isLast: boolean;
  running: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const Icon = STEP_ICON[step.id];
  const status: PipelineStepStatus = running ? "running" : step.status;

  return (
    <li className="relative animate-fade-up pl-9">
      {/* đường nối timeline */}
      {!isLast ? (
        <span
          aria-hidden
          className="absolute left-[13px] top-8 bottom-0 w-px bg-border"
        />
      ) : null}

      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1.5 grid size-[27px] place-items-center rounded-lg border",
          status === "running"
            ? "border-accent/40 bg-accent-soft text-accent"
            : status === "fallback"
              ? "border-warn/40 bg-warn-soft text-warn"
              : status === "skipped"
                ? "border-border bg-surface-2 text-fg-subtle"
                : "border-border bg-surface-2 text-accent",
        )}
      >
        <Icon className="size-[15px]" />
      </span>

      <div className="pb-2.5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono text-[10px] text-fg-subtle">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[13px] font-semibold text-fg">
                {step.title}
              </span>
              <StatusBadge status={status} />
              {/* Nhãn riêng cho từng bước: tầng nào chạy code thật, tầng nào
                  còn mock. Một bước mock không được phép trông như live. */}
              <WiringBadge wiring={step.wiring} note={step.note} />
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-fg-subtle">
              <span className="truncate font-mono">{step.subtitle}</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Timer className="size-3" aria-hidden />
                {formatMs(step.durationMs)}
              </span>
            </span>
          </span>
          <ChevronRight
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-fg-subtle transition-transform duration-200",
              open && "rotate-90",
            )}
          />
        </button>

        {open ? (
          <div
            id={panelId}
            className="mt-2 animate-fade-in rounded-xl border border-border bg-surface-2/60 p-2.5"
          >
            <StepDetails detail={step.detail} />
          </div>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Khối "diễn giải từng bước" — mặc định đóng, mở ra là timeline 6 bước
 * của retrieval pipeline. Mỗi bước lại thu/mở riêng được.
 */
export function PipelineTrace({
  steps,
  totalMs,
  streaming = false,
  revealedSteps,
  usedFallback = false,
  source,
}: {
  steps: PipelineStep[];
  totalMs: number;
  streaming?: boolean;
  revealedSteps?: number;
  usedFallback?: boolean;
  /** Toàn bộ trace này đến từ backend thật hay từ mock. */
  source?: DataSource;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const visibleCount = revealedSteps ?? steps.length;
  const visible = steps.slice(0, Math.max(0, visibleCount));
  const runningIndex = streaming ? visible.length - 1 : -1;
  const current = streaming ? visible[visible.length - 1] : undefined;

  if (steps.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronRight
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-fg-subtle transition-transform duration-200",
            open && "rotate-90",
          )}
        />
        <span className="min-w-0 flex-1 text-[13px] font-medium text-fg-muted">
          {streaming && current ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-3.5 shrink-0 animate-spin text-accent" aria-hidden />
              <span className="truncate">
                Đang chạy bước {visible.length}/{steps.length} —{" "}
                <span className="text-fg">{current.title}</span>
              </span>
            </span>
          ) : (
            <>
              Đã truy xuất qua{" "}
              <span className="text-fg">{steps.length} bước</span>
              <span className="text-fg-subtle"> · </span>
              <span className="font-mono tabular-nums">{formatMs(totalMs)}</span>
            </>
          )}
        </span>
        {source ? <DataSourceBadge source={source} className="shrink-0" /> : null}
        {usedFallback && !streaming ? (
          <span className="shrink-0 rounded-md border border-warn/30 bg-warn-soft px-1.5 py-0.5 text-[10px] font-medium text-warn">
            PageIndex fallback
          </span>
        ) : null}
        <span className="hidden shrink-0 text-[11px] text-fg-subtle sm:block">
          {open ? "Thu gọn" : "Xem chi tiết"}
        </span>
      </button>

      {open ? (
        <div id={panelId} className="animate-fade-in border-t border-border p-3">
          <ol className="relative">
            {visible.map((step, i) => (
              <StepRow
                key={`${step.id}-${i}`}
                step={step}
                index={i}
                isLast={i === visible.length - 1}
                running={i === runningIndex}
              />
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
