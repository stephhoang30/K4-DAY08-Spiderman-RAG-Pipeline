import { Crosshair, ListChecks, ShieldCheck, Target } from "lucide-react";
import { StatTile } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { BASELINE_CONFIG, PRIMARY_CONFIG, RAGAS_METRICS } from "@/lib/mock";
import type { RagasMetricId } from "@/lib/types";
import { formatScore } from "@/lib/utils";
import { DeltaBadge } from "./common";

const ICONS: Record<RagasMetricId, React.ComponentType<{ className?: string }>> =
  {
    faithfulness: ShieldCheck,
    answerRelevance: Target,
    contextRecall: ListChecks,
    contextPrecision: Crosshair,
  };

/**
 * Hàng thẻ tổng quan bốn chỉ số RAGAS của cấu hình chính.
 * Delta tính so với config đối chứng (`dense_only`).
 */
export function MetricOverview() {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {RAGAS_METRICS.map((metric) => {
          const Icon = ICONS[metric.id];
          return (
            <StatTile
              key={metric.id}
              icon={<Icon className="size-3.5" />}
              label={metric.label}
              value={
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className={metric.passed ? "text-fg" : "text-danger"}>
                      {formatScore(metric.value)}
                    </span>
                    <DeltaBadge delta={metric.delta} />
                  </div>
                  <ScoreBar
                    value={metric.value}
                    tone={metric.passed ? "ok" : "danger"}
                    width="flex-1"
                    className="w-full"
                  />
                </div>
              }
              hint={`${metric.labelVi} — ${metric.description}`}
            />
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
        Điểm của cấu hình{" "}
        <code className="font-mono text-fg-muted">{PRIMARY_CONFIG.label}</code>,
        trung bình trên toàn bộ golden dataset. Ngưỡng đạt của bài lab là{" "}
        <span className="font-mono tabular-nums text-fg-muted">
          {RAGAS_METRICS[0].threshold.toFixed(2)}
        </span>{" "}
        cho cả bốn chỉ số; Δ là chênh lệch so với config đối chứng{" "}
        <code className="font-mono text-fg-muted">{BASELINE_CONFIG.label}</code>{" "}
        (chỉ semantic search).
      </p>
    </div>
  );
}
