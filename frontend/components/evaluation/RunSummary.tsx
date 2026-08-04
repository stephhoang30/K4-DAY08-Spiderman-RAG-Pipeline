import { ScoreBar } from "@/components/ui/ScoreBar";
import {
  EVALUATION_RUN,
  FALLBACK_QUERIES,
  GOLDEN_PASSED,
  GOLDEN_TOTAL,
  PRIMARY_CONFIG,
  RETRIEVAL_CONFIGS,
} from "@/lib/mock";
import { formatMs } from "@/lib/utils";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-fg-subtle">{label}</dt>
      <dd className="min-w-0 truncate text-right font-mono text-fg-muted">
        {value}
      </dd>
    </div>
  );
}

/** Thông tin lần chạy đánh giá — đặt trong sidebar của trang. */
export function RunSummary() {
  const passRate = GOLDEN_PASSED / GOLDEN_TOTAL;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-slim px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
        Lần chạy đánh giá
      </p>

      <dl className="mt-2 space-y-1.5 text-[11px]">
        <Row label="Mã run" value={EVALUATION_RUN.runId} />
        <Row label="Ngày chạy" value={EVALUATION_RUN.ranAt} />
        <Row label="Bộ câu hỏi" value={`${EVALUATION_RUN.datasetSize} cặp Q&A`} />
        <Row label="Config chính" value={EVALUATION_RUN.primaryConfigLabel} />
        <Row label="Config so sánh" value={`${RETRIEVAL_CONFIGS.length} bộ`} />
        <Row label="LLM chấm" value={EVALUATION_RUN.judgeModel} />
        <Row label="Độ trễ TB" value={formatMs(PRIMARY_CONFIG.avgLatencyMs)} />
        <Row
          label="PageIndex"
          value={`${FALLBACK_QUERIES.length} truy vấn`}
        />
      </dl>

      <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] text-fg-subtle">Tỉ lệ câu đạt</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-fg">
            {GOLDEN_PASSED}/{GOLDEN_TOTAL}
          </span>
        </div>
        <ScoreBar
          value={passRate}
          tone={passRate >= 0.7 ? "ok" : "warn"}
          width="flex-1"
          className="mt-2 w-full"
        />
        <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">
          Một ca chỉ tính là đạt khi cả bốn chỉ số RAGAS đều ≥ 0.70.
        </p>
      </div>
    </div>
  );
}
