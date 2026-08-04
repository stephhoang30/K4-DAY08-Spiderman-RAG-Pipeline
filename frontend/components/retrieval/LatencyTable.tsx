"use client";

import type { PipelineStep } from "@/lib/types";
import { STATUS_CLASS, STATUS_LABEL, STEP_ICON } from "@/components/chat/stepMeta";
import { cn, formatMs } from "@/lib/utils";

/**
 * Bảng độ trễ từng bước — số liệu lấy thẳng từ `durationMs` của mỗi PipelineStep.
 * Thanh ngang dùng chung thang: % so với tổng thời gian của lần chạy.
 */
export function LatencyTable({
  steps,
  totalMs,
}: {
  steps: PipelineStep[];
  totalMs: number;
}) {
  const measured = steps.reduce((sum, step) => sum + step.durationMs, 0);
  const base = Math.max(measured, 1);
  const retrievalMs = steps
    .filter((step) => step.id !== "generation")
    .reduce((sum, step) => sum + step.durationMs, 0);
  const slowest = steps.reduce(
    (max, step) => (step.durationMs > max ? step.durationMs : max),
    0,
  );

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto scrollbar-slim rounded-xl border border-border">
        <table className="w-full min-w-[38rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-[10px] uppercase tracking-wide text-fg-subtle">
              <th className="px-3 py-2 font-medium">Bước</th>
              <th className="px-2 py-2 font-medium">Trạng thái</th>
              <th className="px-2 py-2 text-right font-medium">Thời gian</th>
              <th className="px-2 py-2 text-right font-medium">% tổng</th>
              <th className="w-2/5 px-3 py-2 font-medium">Tỉ trọng</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, i) => {
              const Icon = STEP_ICON[step.id];
              const pct = (step.durationMs / base) * 100;
              return (
                <tr
                  key={`${step.id}-${i}`}
                  className="border-b border-border/60 bg-surface last:border-0"
                >
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-surface-2 text-accent">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-fg">
                          {step.title}
                        </span>
                        <span className="block truncate font-mono text-[10px] text-fg-subtle">
                          {step.subtitle}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap",
                        STATUS_CLASS[step.status],
                      )}
                    >
                      {STATUS_LABEL[step.status]}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-[11px] font-semibold tabular-nums text-fg">
                    {formatMs(step.durationMs)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-[11px] tabular-nums text-fg-muted">
                    {pct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2">
                    <span className="block h-2 w-full overflow-hidden rounded-full bg-surface-3">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          step.durationMs === slowest ? "bg-warn" : "bg-accent",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-surface-2">
              <td className="px-3 py-2 text-xs font-semibold text-fg">Tổng</td>
              <td className="px-2 py-2 text-[11px] text-fg-subtle">
                {steps.length} bước
              </td>
              <td className="px-2 py-2 text-right font-mono text-[11px] font-semibold tabular-nums text-fg">
                {formatMs(measured)}
              </td>
              <td className="px-2 py-2 text-right font-mono text-[11px] tabular-nums text-fg-subtle">
                100%
              </td>
              <td className="px-3 py-2 font-mono text-[10px] text-fg-subtle">
                trace ghi nhận {formatMs(totalMs)} tính cả overhead
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-[11px] leading-relaxed text-fg-subtle">
        Riêng phần truy xuất (bỏ bước sinh câu trả lời) tốn{" "}
        <strong className="font-mono text-fg-muted">{formatMs(retrievalMs)}</strong>.
        Cross-encoder và nhánh PageIndex là hai chỗ đắt nhất: rerank phải chấm lại
        từng cặp (câu hỏi, chunk), còn PageIndex phải gọi thêm LLM để duyệt cây mục
        lục — thêm một lý do không nên để ngưỡng fallback kích hoạt nhầm.
      </p>
    </div>
  );
}
