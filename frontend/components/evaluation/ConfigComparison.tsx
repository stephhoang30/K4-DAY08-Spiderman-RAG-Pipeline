import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  BASELINE_CONFIG,
  METRIC_IDS,
  METRIC_META,
  RAGAS_THRESHOLD,
  RETRIEVAL_CONFIGS,
  deltaVsBaseline,
} from "@/lib/mock";
import type { RetrievalConfigId } from "@/lib/types";
import { cn, formatMs, formatScore } from "@/lib/utils";
import { DeltaBadge, MetricValue } from "./common";

/**
 * Màu từng config — chỉ dùng token ngữ nghĩa nên tự đảo đúng ở dark mode.
 * Xám = đối chứng, vàng = lexical, xanh = hybrid, xanh lá = config chính.
 */
const SERIES_COLOR: Record<RetrievalConfigId, string> = {
  dense_only: "var(--fg-subtle)",
  bm25_only: "var(--warn)",
  hybrid_rrf: "var(--accent)",
  hybrid_rerank: "var(--ok)",
};

// ---------------------------------------------------------------------------
// Biểu đồ cột — vẽ tay bằng SVG, không dùng thư viện chart
// ---------------------------------------------------------------------------

const W = 720;
const H = 268;
const PAD = { top: 12, right: 10, bottom: 46, left: 38 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const GROUP_W = PLOT_W / METRIC_IDS.length;
const BAR_W = 26;
const BAR_GAP = 6;
const GROUP_INNER_W =
  BAR_W * RETRIEVAL_CONFIGS.length + BAR_GAP * (RETRIEVAL_CONFIGS.length - 1);
const GROUP_OFFSET = (GROUP_W - GROUP_INNER_W) / 2;

const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

function y(value: number): number {
  return PAD.top + PLOT_H * (1 - value);
}

function ComparisonChart() {
  return (
    <div className="overflow-x-auto scrollbar-slim px-4 py-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Biểu đồ cột so sánh bốn chỉ số RAGAS giữa bốn cấu hình truy xuất"
        className="h-auto w-full min-w-[38rem]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Lưới ngang + nhãn trục dọc */}
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT_W}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(tick) + 3.5}
              textAnchor="end"
              fontSize={10}
              fill="var(--fg-subtle)"
              fontFamily="var(--font-app-mono)"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Ngưỡng đạt 0.70 — nhãn nằm ở chú giải phía trên để không đè lên cột */}
        <line
          x1={PAD.left}
          x2={PAD.left + PLOT_W}
          y1={y(RAGAS_THRESHOLD)}
          y2={y(RAGAS_THRESHOLD)}
          stroke="var(--warn)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />

        {/* Bốn nhóm cột, mỗi nhóm là một chỉ số */}
        {METRIC_IDS.map((metricId, gi) => {
          const groupX = PAD.left + gi * GROUP_W;
          return (
            <g key={metricId}>
              {RETRIEVAL_CONFIGS.map((config, bi) => {
                const value = config.scores[metricId];
                const x = groupX + GROUP_OFFSET + bi * (BAR_W + BAR_GAP);
                const barY = y(value);
                return (
                  <g key={config.id}>
                    <rect
                      x={x}
                      y={barY}
                      width={BAR_W}
                      height={Math.max(1, PAD.top + PLOT_H - barY)}
                      rx={2}
                      fill={SERIES_COLOR[config.id]}
                      opacity={config.isPrimary ? 1 : 0.82}
                    >
                      <title>
                        {config.label} · {METRIC_META[metricId].label} ={" "}
                        {formatScore(value)}
                      </title>
                    </rect>
                    <text
                      x={x + BAR_W / 2}
                      y={barY - 5}
                      textAnchor="middle"
                      fontSize={9}
                      fill="var(--fg-subtle)"
                      fontFamily="var(--font-app-mono)"
                    >
                      {value.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              <text
                x={groupX + GROUP_W / 2}
                y={PAD.top + PLOT_H + 18}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="var(--fg-muted)"
              >
                {METRIC_META[metricId].label}
              </text>
              <text
                x={groupX + GROUP_W / 2}
                y={PAD.top + PLOT_H + 33}
                textAnchor="middle"
                fontSize={10}
                fill="var(--fg-subtle)"
              >
                {METRIC_META[metricId].labelVi}
              </text>
            </g>
          );
        })}

        {/* Trục ngang */}
        <line
          x1={PAD.left}
          x2={PAD.left + PLOT_W}
          y1={PAD.top + PLOT_H}
          y2={PAD.top + PLOT_H}
          stroke="var(--border-strong)"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

function ChartLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {RETRIEVAL_CONFIGS.map((config) => (
        <li key={config.id} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: SERIES_COLOR[config.id] }}
          />
          <span className="font-mono text-[11px] text-fg-muted">
            {config.label}
          </span>
          {config.isPrimary ? <Badge tone="accent">chính</Badge> : null}
          {config.isBaseline ? <Badge tone="neutral">đối chứng</Badge> : null}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="h-0 w-5 shrink-0 border-t-2 border-dashed border-warn"
        />
        <span className="font-mono text-[11px] text-fg-muted">
          ngưỡng {RAGAS_THRESHOLD.toFixed(2)}
        </span>
      </li>
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Bảng A/B
// ---------------------------------------------------------------------------

function ComparisonTable() {
  return (
    <div className="overflow-x-auto scrollbar-slim">
      <table className="w-full min-w-[56rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-fg-subtle">
            <th className="px-4 py-2 font-medium">Config</th>
            {METRIC_IDS.map((id) => (
              <th key={id} className="px-3 py-2 text-right font-medium">
                {METRIC_META[id].label}
              </th>
            ))}
            <th className="px-3 py-2 text-right font-medium">Câu đạt</th>
            <th className="px-4 py-2 text-right font-medium">Độ trễ TB</th>
          </tr>
        </thead>
        <tbody>
          {RETRIEVAL_CONFIGS.map((config) => (
            <tr
              key={config.id}
              className={cn(
                "border-b border-border/60 align-top last:border-0",
                config.isPrimary && "bg-accent-soft/45",
              )}
            >
              <td className="max-w-[20rem] px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: SERIES_COLOR[config.id] }}
                  />
                  <code className="font-mono text-xs font-semibold text-fg">
                    {config.label}
                  </code>
                  {config.isPrimary ? (
                    <Badge tone="accent">chính</Badge>
                  ) : null}
                  {config.isBaseline ? (
                    <Badge tone="neutral">đối chứng</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
                  {config.description}
                </p>
              </td>

              {METRIC_IDS.map((id) => (
                <td key={id} className="px-3 py-2.5 text-right">
                  <MetricValue
                    value={config.scores[id]}
                    threshold={RAGAS_THRESHOLD}
                  />
                  <div className="mt-1">
                    {config.isBaseline ? (
                      <span className="font-mono text-[10px] text-fg-subtle">
                        —
                      </span>
                    ) : (
                      <DeltaBadge delta={deltaVsBaseline(config, id)} />
                    )}
                  </div>
                </td>
              ))}

              <td className="px-3 py-2.5 text-right">
                <span className="font-mono text-xs font-semibold tabular-nums text-fg">
                  {config.passedCases}/{config.totalCases}
                </span>
                <div className="mt-1 font-mono text-[10px] tabular-nums text-fg-subtle">
                  {Math.round((config.passedCases / config.totalCases) * 100)}%
                </div>
              </td>
              <td className="px-4 py-2.5 text-right">
                <span className="font-mono text-xs tabular-nums text-fg-muted">
                  {formatMs(config.avgLatencyMs)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConfigComparison() {
  const bm25 = RETRIEVAL_CONFIGS.find((c) => c.id === "bm25_only");
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader
          title="Bốn chỉ số × bốn cấu hình"
          description={`Cùng ${RETRIEVAL_CONFIGS[0].totalCases} câu hỏi, chỉ thay tầng truy xuất. Đường đứt nét là ngưỡng đạt ${RAGAS_THRESHOLD.toFixed(2)}.`}
        />
        <div className="px-4 pt-3">
          <ChartLegend />
        </div>
        <ComparisonChart />
      </Card>

      <Card>
        <CardHeader
          title="Bảng đối chiếu"
          description={`Cột Δ dưới mỗi điểm là chênh lệch so với config đối chứng ${BASELINE_CONFIG.label}.`}
        />
        <ComparisonTable />
      </Card>

      <ul className="space-y-1.5 text-[11px] leading-relaxed text-fg-subtle">
        <li>
          <span className="font-medium text-fg-muted">dense_only</span> hụt rõ
          nhất ở Context Recall ({formatScore(BASELINE_CONFIG.scores.contextRecall)}
          ): câu hỏi hỏi số hiệu, tên riêng hoặc con số bị embedding làm mờ, chunk
          chứa đáp án không lọt top-k.
        </li>
        {bm25 ? (
          <li>
            <span className="font-medium text-fg-muted">bm25_only</span> ngược
            lại — Context Precision còn khá (
            {formatScore(bm25.scores.contextPrecision)}) với câu có từ khoá trùng
            nguyên văn, nhưng Answer Relevance thấp nhất bảng (
            {formatScore(bm25.scores.answerRelevance)}) vì không hiểu câu hỏi diễn
            đạt vòng.
          </li>
        ) : null}
        <li>
          Rerank là bước tốn kém nhất về độ trễ (
          {formatMs(RETRIEVAL_CONFIGS[3].avgLatencyMs)} so với{" "}
          {formatMs(RETRIEVAL_CONFIGS[2].avgLatencyMs)}) nhưng đổi lại thêm 1 câu
          đạt và toàn bộ bốn chỉ số đều tăng.
        </li>
      </ul>
    </div>
  );
}
